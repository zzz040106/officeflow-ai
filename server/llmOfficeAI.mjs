import { simulateOfficeAITask } from "../src/officeAI.js";

const DEFAULT_BASE_URLS = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  kimi: "https://api.moonshot.ai/v1",
};

const DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  deepseek: "deepseek-chat",
  anthropic: "claude-sonnet-4-5",
  gemini: "gemini-2.5-flash",
  qwen: "qwen-plus",
  kimi: "moonshot-v1-8k",
};

function normalizeBaseUrl(baseUrl = "") {
  return String(baseUrl || "").trim().replace(/\/+$/, "");
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSearchQuery(config = {}) {
  const text = `${config.title || ""} ${config.inputText || ""}`
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 80) || "AI 办公 自动化";
}

async function fetchWithTimeout(fetchImpl, url, options = {}, ms = 6500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function webSearch(config = {}, fetchImpl = fetch) {
  const query = extractSearchQuery(config);
  const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetchWithTimeout(
      fetchImpl,
      searchUrl,
      {
        headers: {
          "user-agent": "Mozilla/5.0 OfficeFlowAI/0.1",
          accept: "text/html,application/xhtml+xml",
        },
      },
      6500,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const results = [];
    const pattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = pattern.exec(html)) && results.length < 5) {
      let url = match[1].replace(/&amp;/g, "&");
      try {
        const parsed = new URL(url, "https://duckduckgo.com");
        const uddg = parsed.searchParams.get("uddg");
        if (uddg) url = decodeURIComponent(uddg);
      } catch {
        // Keep original URL if parsing fails.
      }
      results.push({
        title: stripHtml(match[2]) || "相关网页",
        url,
        summary: stripHtml(match[3]) || "搜索结果摘要为空，建议打开原文核对。",
        source: "DuckDuckGo",
      });
    }
    if (results.length) return results;
  } catch {
    // Fall through to search landing pages.
  }

  return [
    {
      title: `DuckDuckGo 检索：${query}`,
      url: searchUrl,
      summary: "当前环境无法直接解析搜索结果，可打开该检索页查看相关来源。",
      source: "Search",
    },
    {
      title: `Bing 检索：${query}`,
      url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      summary: "备用检索入口，适合复核新闻、企业官网和行业资料。",
      source: "Search",
    },
  ];
}

function buildSystemPrompt() {
  return [
    "你是 OfficeFlow AI 的办公自动化 Agent，负责把用户提交的办公材料处理成可复核、可复制的中文办公产出。",
    "你可以根据用户任务自动使用传入的 officeSkills。officeSkills 是当前 Agent 可用的办公 Skill，代表可调用的能力模块，不需要用户手动选择。",
    "如果 officeSkills 包含 Documents，请优先保证文档结构、措辞、格式和复核清单；如果包含 Spreadsheets，请优先输出指标、异常、统计口径和表格化待办；如果包含 Presentations，请优先输出汇报逻辑和可转成 PPT 的提纲；如果包含 Gmail，请优先输出可发送的邮件/通知草稿。",
    "必须只返回 JSON 对象，不要 Markdown，不要代码块。",
    "JSON 字段必须包含：ready, taskType, title, audience, department, style, summary, keyPoints, todos, metrics, reviewChecklist, recommendation。",
    "todos 是数组，每项包含 owner, item, due。metrics 包含 inputWords, estimatedMinutesSaved, sectionsGenerated, reviewRequired。",
    "如果 taskType 是 format，必须额外返回 formattedDraft, companyFormatRules, formatIssues, typoIssues。",
    "如果 taskType 是 research，必须额外返回 sourceLinks。sourceLinks 每项包含 title, url, summary, source；url 仅作内部参考，summary 要写成可直接给用户看的检索摘要。",
    "内容要专业、清晰、适合公司办公场景；不要编造无法从材料或检索结果推断的事实。",
  ].join("\n");
}

function buildUserPrompt(config = {}) {
  return JSON.stringify(
    {
      taskType: config.taskType,
      title: config.title,
      audience: config.audience,
      department: config.department,
      style: config.style,
      inputText: config.inputText,
      webResults: config.webResults || [],
      officeSkills: Array.isArray(config.skills) ? config.skills : [],
      companyFormat:
        config.taskType === "format"
          ? {
              title: "公司标准文档格式",
              rules: [
                "标题采用“关于XXX的通知/方案/报告”结构。",
                "正文按“背景/目的、具体要求、时间节点、责任部门、联系人或附件说明”组织。",
                "落款统一为“总经理办公室”，日期使用中文年月日。",
                "语气正式，不使用口语化表达。",
                "必须指出原文与固定格式不一致的地方和疑似错别字。",
              ],
            }
          : undefined,
      expectedOutput:
        "根据 taskType 生成对应办公结果：会议纪要、公文润色、格式/内容修正、合同摘要、数据统计摘要或联网信息检索简报。",
    },
    null,
    2,
  );
}

function stripJsonFence(content) {
  return String(content || "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function extractTextFromProviderBody(provider, body) {
  if (provider === "anthropic") {
    return (body.content || []).filter((item) => item?.type === "text").map((item) => item.text).join("\n");
  }
  if (provider === "gemini") {
    return (body.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("\n");
  }
  return body.choices?.[0]?.message?.content || "";
}

function asProviderMessages(messages = []) {
  return messages
    .filter((message) => message && message.role && message.content)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content),
    }));
}

async function callOpenAiCompatible({ baseUrl, model, apiKey, messages, jsonMode }, fetchImpl) {
  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages,
    }),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function callAnthropic({ baseUrl, model, apiKey, messages, jsonMode }, fetchImpl) {
  const system = messages.find((message) => message.role === "system")?.content || "";
  const userMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: String(message.content) }));
  const response = await fetchImpl(`${baseUrl}/messages`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 2200,
      temperature: 0.2,
      ...(system ? { system } : {}),
      messages: jsonMode ? [...userMessages, { role: "user", content: "请严格返回 JSON 对象，不要 Markdown。" }] : userMessages,
    }),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function callGemini({ baseUrl, model, apiKey, messages, jsonMode }, fetchImpl) {
  const system = messages.find((message) => message.role === "system")?.content || "";
  const userText = messages
    .filter((message) => message.role !== "system")
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
    .join("\n\n");
  const url = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      generationConfig: { temperature: 0.2, ...(jsonMode ? { responseMimeType: "application/json" } : {}) },
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents: [{ role: "user", parts: [{ text: userText }] }],
    }),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function callConfiguredModel(aiSettings = {}, messages = [], fetchImpl = fetch, { jsonMode = false } = {}) {
  const provider = aiSettings.provider || "openai";
  const apiKey = String(aiSettings.apiKey || "").trim();
  const baseUrl = normalizeBaseUrl(aiSettings.baseUrl || DEFAULT_BASE_URLS[provider]);
  const model = String(aiSettings.model || DEFAULT_MODELS[provider] || "").trim();
  if (!apiKey || !baseUrl || !model) return { configured: false, provider, model, content: "" };
  const request = { baseUrl, model, apiKey, messages, jsonMode };
  const { response, body } =
    provider === "anthropic"
      ? await callAnthropic(request, fetchImpl)
      : provider === "gemini"
        ? await callGemini(request, fetchImpl)
        : await callOpenAiCompatible(request, fetchImpl);
  if (!response.ok) {
    const detail = body.error?.message || body.message || body.error || `HTTP ${response.status}`;
    throw new Error(`AI 模型调用失败：${detail}`);
  }
  return { configured: true, provider, model, content: extractTextFromProviderBody(provider, body) };
}

function normalizeAiOutput(output, config) {
  const fallback = simulateOfficeAITask(config);
  const metrics = output.metrics && typeof output.metrics === "object" ? output.metrics : {};
  return {
    ...fallback,
    ...output,
    ready: output.ready !== false,
    taskType: output.taskType || config.taskType || fallback.taskType,
    title: output.title || config.title || fallback.title,
    audience: output.audience || config.audience || fallback.audience,
    department: output.department || config.department || fallback.department,
    style: output.style || config.style || fallback.style,
    keyPoints: Array.isArray(output.keyPoints) ? output.keyPoints : fallback.keyPoints,
    todos: Array.isArray(output.todos) ? output.todos : fallback.todos,
    sourceLinks: Array.isArray(output.sourceLinks) ? output.sourceLinks : fallback.sourceLinks,
    formatIssues: Array.isArray(output.formatIssues) ? output.formatIssues : fallback.formatIssues,
    typoIssues: Array.isArray(output.typoIssues) ? output.typoIssues : fallback.typoIssues,
    reviewChecklist: Array.isArray(output.reviewChecklist) ? output.reviewChecklist : fallback.reviewChecklist,
    skillsUsed: Array.isArray(output.skillsUsed) ? output.skillsUsed : config.skills?.map((skill) => skill.name || skill.id).filter(Boolean) || [],
    companyFormatRules: Array.isArray(output.companyFormatRules) ? output.companyFormatRules : fallback.companyFormatRules,
    formattedDraft: output.formattedDraft || fallback.formattedDraft,
    metrics: { ...fallback.metrics, ...metrics, reviewRequired: metrics.reviewRequired ?? true },
    recommendation: output.recommendation || fallback.recommendation,
    modelProvider: output.modelProvider || undefined,
  };
}

export async function runOfficeAITask(config = {}, aiSettings = {}, fetchImpl = fetch) {
  const enrichedConfig = {
    ...config,
    ...(config.taskType === "research" ? { webResults: await webSearch(config, fetchImpl) } : {}),
  };
  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(enrichedConfig) },
  ];
  const result = await callConfiguredModel(aiSettings, messages, fetchImpl, { jsonMode: true });
  if (!result.configured) {
    return {
      ...simulateOfficeAITask(enrichedConfig),
      skillsUsed: Array.isArray(enrichedConfig.skills)
        ? enrichedConfig.skills.map((skill) => skill.name || skill.id).filter(Boolean)
        : [],
      modelProvider: "local-demo",
      recommendation:
        "当前未配置 AI 大模型 API Key，已使用本地演示逻辑生成结果。配置模型后可调用真实大模型进行更完整的生成与分析。",
    };
  }
  if (!result.content) throw new Error("AI 模型没有返回可解析内容。");
  const parsed = JSON.parse(stripJsonFence(result.content));
  return normalizeAiOutput({ ...parsed, modelProvider: `${result.provider} / ${result.model}` }, enrichedConfig);
}

export async function runOfficeChat(messages = [], aiSettings = {}, fetchImpl = fetch) {
  const provider = aiSettings.provider || "openai";
  const model = aiSettings.model || DEFAULT_MODELS[provider] || "未配置模型";
  const preparedMessages = [
    {
      role: "system",
      content: [
        "你是 OfficeFlow AI 的办公 Agent。用中文回答，帮助用户梳理办公任务、选择办公场景、改写材料、生成行动建议。",
        `当前用户选择的模型配置是：${provider} / ${model}。如果用户问“你是什么模型”，请回答当前选择的是这个配置。`,
        "回答要简洁、可执行，不要过度寒暄。",
      ].join("\n"),
    },
    ...asProviderMessages(messages),
  ];
  const result = await callConfiguredModel(aiSettings, preparedMessages, fetchImpl);
  if (!result.configured) {
    const last = messages[messages.length - 1]?.content || "";
    return {
      content: `我收到了：${last || "你的办公需求"}。\n\n当前还没有配置可用的 API Key，所以我先按演示模式工作。你可以选择左侧办公场景库生成会议纪要、公文润色、格式/内容修正、合同摘要、数据统计或信息检索简报。`,
      modelProvider: "local-demo",
    };
  }
  return { content: result.content || "模型没有返回内容，请稍后重试。", modelProvider: `${result.provider} / ${result.model}` };
}
