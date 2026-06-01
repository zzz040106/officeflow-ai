const dom = {
  templateList: document.querySelector("#templateList"),
  workflowList: document.querySelector("#workflowList"),
  workbenchShell: document.querySelector("#workbenchShell"),
  inspectorPanel: document.querySelector("#inspectorPanel"),
  surfaceScrim: document.querySelector("#surfaceScrim"),
  activeTemplateBadge: document.querySelector("#activeTemplateBadge"),
  aiProviderSelect: document.querySelector("#aiProviderSelect"),
  modelModal: document.querySelector("#modelModal"),
  providerGrid: document.querySelector("#providerGrid"),
  providerConfigTitle: document.querySelector("#providerConfigTitle"),
  providerConfigHint: document.querySelector("#providerConfigHint"),
  openModelModalButton: document.querySelector("#openModelModalButton"),
  closeModelModalButton: document.querySelector("#closeModelModalButton"),
  closeModelModalSecondaryButton: document.querySelector("#closeModelModalSecondaryButton"),
  aiModelVersionSelect: document.querySelector("#aiModelVersionSelect"),
  aiProfileList: document.querySelector("#aiProfileList"),
  aiProfileNameInput: document.querySelector("#aiProfileNameInput"),
  aiBaseUrlInput: document.querySelector("#aiBaseUrlInput"),
  aiModelInput: document.querySelector("#aiModelInput"),
  aiApiKeyInput: document.querySelector("#aiApiKeyInput"),
  aiContextInput: document.querySelector("#aiContextInput"),
  aiContextOutput: document.querySelector("#aiContextOutput"),
  aiToolRounds: document.querySelector("#aiToolRounds"),
  aiConfigStatus: document.querySelector("#aiConfigStatus"),
  saveAiProfileButton: document.querySelector("#saveAiProfileButton"),
  deleteAiProfileButton: document.querySelector("#deleteAiProfileButton"),
  scenarioPanelEyebrow: document.querySelector("#scenarioPanelEyebrow"),
  scenarioPanelTitle: document.querySelector("#scenarioPanelTitle"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioHint: document.querySelector("#scenarioHint"),
  scenarioModeBadge: document.querySelector("#scenarioModeBadge"),
  scenarioFields: document.querySelector("#scenarioFields"),
  mainResultPanel: document.querySelector("#mainResultPanel"),
  advancedConfig: document.querySelector("#advancedConfig"),
  workflowName: document.querySelector("#workflowName"),
  methodSelect: document.querySelector("#methodSelect"),
  urlInput: document.querySelector("#urlInput"),
  queryInput: document.querySelector("#queryInput"),
  headersInput: document.querySelector("#headersInput"),
  bodyInput: document.querySelector("#bodyInput"),
  outputMapInput: document.querySelector("#outputMapInput"),
  conditionLeft: document.querySelector("#conditionLeft"),
  conditionOperator: document.querySelector("#conditionOperator"),
  conditionRight: document.querySelector("#conditionRight"),
  messageInput: document.querySelector("#messageInput"),
  notificationToggle: document.querySelector("#notificationToggle"),
  speechToggle: document.querySelector("#speechToggle"),
  favoriteWorkflowButton: document.querySelector("#favoriteWorkflowButton"),
  runWorkflowButton: document.querySelector("#runWorkflowButton"),
  inspectorToggleButton: document.querySelector("#inspectorToggleButton"),
  closeWorkbenchButton: document.querySelector("#closeWorkbenchButton"),
  inspectorCloseButton: document.querySelector("#inspectorCloseButton"),
  clearOutputButton: document.querySelector("#clearOutputButton"),
  resultTitle: document.querySelector("#resultTitle"),
  resultMessage: document.querySelector("#resultMessage"),
  outputPreview: document.querySelector("#outputPreview"),
  logList: document.querySelector("#logList"),
  apiNodeMeta: document.querySelector("#apiNodeMeta"),
  conditionNodeMeta: document.querySelector("#conditionNodeMeta"),
  notifyNodeMeta: document.querySelector("#notifyNodeMeta"),
  metricOutputCount: document.querySelector("#metricOutputCount"),
  metricStatus: document.querySelector("#metricStatus"),
  metricActiveWorkflow: document.querySelector("#metricActiveWorkflow"),
  metricLogCount: document.querySelector("#metricLogCount"),
  metricSavedCount: document.querySelector("#metricSavedCount"),
  outputMetricList: document.querySelector("#outputMetricList"),
  agentChatPanel: document.querySelector("#agentChatPanel"),
  agentChatMessages: document.querySelector("#agentChatMessages"),
  agentChatForm: document.querySelector("#agentChatForm"),
  agentChatInput: document.querySelector("#agentChatInput"),
  agentChatSendButton: document.querySelector("#agentChatSendButton"),
  agentModelSelect: document.querySelector("#agentModelSelect"),
  conversationList: document.querySelector("#conversationList"),
  newConversationButton: document.querySelector("#newConversationButton"),
};

const nodeElements = Object.fromEntries(
  [...document.querySelectorAll("[data-node]")].map((node) => [
    node.dataset.node,
    node,
  ]),
);

const STATIC_MODE_MESSAGE =
  "当前是 index.html 静态预览模式。模板和界面可以查看，调用 AI 与运行流程需要先执行 npm start，再通过 http://127.0.0.1:5173/ 打开。";

const AI_CONFIG_STORAGE_KEY = "officeflow-ai-model-config";
const AI_PROFILES_STORAGE_KEY = "officeflow-ai-model-profiles";
const AI_ACTIVE_PROFILE_STORAGE_KEY = "officeflow-ai-active-profile";
const CONVERSATION_STORAGE_KEY = "officeflow-conversations";
const ACTIVE_CONVERSATION_STORAGE_KEY = "officeflow-active-conversation";

const RESULT_LABELS_BY_TASK = {
  meeting: { points: "会议结论", todos: "待办事项" },
  official: { points: "修改要点", todos: "发布待办" },
  format: { points: "修正要点", todos: "处理事项" },
  contract: { points: "核心条款", todos: "复核事项" },
  data: { points: "指标摘要", todos: "跟进事项" },
  research: { points: "可用于汇报的观点", todos: "核实事项" },
};

const AI_PROVIDER_PRESETS = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
  },
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  anthropic: {
    label: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-5",
    models: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-3-5-haiku-latest"],
  },
  qwen: {
    label: "阿里云",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    models: ["qwen-plus", "qwen-max", "qwen-turbo", "qwen-long"],
  },
  kimi: {
    label: "Kimi",
    baseUrl: "https://api.moonshot.ai/v1",
    model: "moonshot-v1-8k",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
  },
};

const OFFICE_TASKS = {
  meeting: {
    label: "会议纪要整理",
    description: "把会议记录整理为结论、待办、负责人和时间节点。",
    inputLabel: "会议记录",
    assistantLabel: "会议助手",
    panelTitle: "会议信息",
    workbenchTitle: "填写会议记录",
    materialTitle: "会议记录材料",
    uploadTitle: "上传、拖入或手动粘贴",
    uploadHint: "支持 Word(.docx)、PDF、Excel(.xlsx/.xlsm)、文本和 CSV；也可以直接在下方粘贴会议记录",
    textareaPlaceholder: "在这里粘贴会议原文、聊天记录或语音转写文本",
    actionLabel: "生成纪要",
    titlePlaceholder: "例如：项目周会纪要",
    defaultInput:
      "本周项目周会：销售侧反馈客户关注交付周期，运营需要下周三前补齐报价表，财务希望统一合同归档口径。张明负责整理客户问题，李娜负责更新报价模板，周五前同步给总经理。",
  },
  official: {
    label: "公文/通知润色",
    description: "把粗略通知、公文材料改写成正式发布稿。",
    inputLabel: "原始文案",
    assistantLabel: "公文助手",
    panelTitle: "公文内容",
    workbenchTitle: "填写公文材料",
    materialTitle: "公文/通知材料",
    uploadTitle: "上传公文、通知或手动粘贴",
    uploadHint: "支持 Word(.docx)、PDF、文本和 CSV；适合粘贴通知草稿、制度片段或发布要求",
    textareaPlaceholder: "在这里粘贴原始通知、公文草稿、发布要求或修改意见",
    actionLabel: "生成公文",
    titlePlaceholder: "例如：部门协作通知",
    defaultInput:
      "请各部门这周把上个月客户资料整理一下，格式尽量统一，周五前发给办公室。后面要做一次客户信息归档，缺的字段要补齐。",
  },
  contract: {
    label: "合同摘要提取",
    description: "提取合同主体、金额、期限、义务和风险提示。",
    inputLabel: "合同条款",
    assistantLabel: "合同助手",
    panelTitle: "合同信息",
    workbenchTitle: "填写合同材料",
    materialTitle: "合同条款材料",
    uploadTitle: "上传合同或粘贴条款",
    uploadHint: "支持 Word(.docx)、PDF、Excel(.xlsx/.xlsm) 和文本；适合合同正文、补充协议或条款摘录",
    textareaPlaceholder: "在这里粘贴合同条款、协议正文或关键约定",
    actionLabel: "提取摘要",
    titlePlaceholder: "例如：客户服务合同摘要",
    defaultInput:
      "甲方委托乙方提供年度客户数据整理服务，服务期 12 个月，总金额 98000 元，分两期付款。乙方需在每月 5 日前提交数据报告，甲方验收后 10 个工作日内付款。若延期交付，应按合同金额 0.5%/日承担违约责任。",
  },
  data: {
    label: "数据统计助手",
    description: "把业务数字转成管理层能快速判断的指标摘要。",
    inputLabel: "数据材料",
    assistantLabel: "数据助手",
    panelTitle: "数据材料",
    workbenchTitle: "填写业务数据",
    materialTitle: "业务数据/表格材料",
    uploadTitle: "上传表格或粘贴数据",
    uploadHint: "支持 Excel(.xlsx/.xlsm)、CSV、PDF、Word 和文本；优先上传表格可获得更完整的指标摘要",
    textareaPlaceholder: "在这里粘贴业务数据、表格摘录、月度指标或异常说明",
    actionLabel: "生成摘要",
    titlePlaceholder: "例如：本月业务数据摘要",
    defaultInput:
      "本月线索 186 条，成交 31 单，成交率 16.7%。上月线索 142 条，成交 22 单。华东区域增长明显，华南区域跟进周期偏长。",
  },
  research: {
    label: "信息检索助手",
    description: "把资料、观察和竞品信息整理成可汇报简报。",
    inputLabel: "资料内容",
    assistantLabel: "检索助手",
    panelTitle: "资料信息",
    workbenchTitle: "填写检索材料",
    materialTitle: "资料/信息材料",
    uploadTitle: "上传资料或粘贴信息",
    uploadHint: "支持 Word(.docx)、PDF、Excel(.xlsx/.xlsm)、文本和 CSV；适合竞品资料、客户反馈或调研片段",
    textareaPlaceholder: "在这里粘贴外部资料、内部信息、竞品观察或调研摘录",
    actionLabel: "生成简报",
    titlePlaceholder: "例如：行业信息简报",
    defaultInput:
      "近期客户更关注 AI 办公、自动化报表、合同智能检索。竞品强调低门槛模板和企业知识库接入，价格多采用按席位订阅。",
  },
};

const OFFICE_TEMPLATE_TYPES = {
  "document-minutes": "meeting",
  "document-polish": "official",
  "format-correction": "format",
  "contract-summary": "contract",
  "data-summary": "data",
  "research-brief": "research",
};

const SCENARIO_DEFAULTS = {
  office: {
    taskType: "meeting",
    title: "项目周会纪要",
    audience: "项目组",
    department: "总经理办公室",
    style: "正式精简",
    inputText: OFFICE_TASKS.meeting.defaultInput,
  },
};

const FALLBACK_TEMPLATES = [
  {
    id: "document-minutes",
    name: "会议纪要整理",
    description: "粘贴会议记录，自动整理结论、待办、负责人和下一步。",
    office: { ...SCENARIO_DEFAULTS.office },
    condition: {
      left: "ai.ready",
      operator: "===",
      right: true,
    },
    message: "{{ai.title}} 已生成，建议复核后发送给{{ai.audience}}。",
  },
  {
    id: "document-polish",
    name: "公文/通知润色",
    description: "输入粗略通知或公文材料，生成更正式、清晰的发布稿。",
    office: {
      taskType: "official",
      title: "部门协作通知",
      audience: "各部门负责人",
      department: "总经理办公室",
      style: "正式规范",
      inputText: OFFICE_TASKS.official.defaultInput,
    },
    condition: {
      left: "ai.ready",
      operator: "===",
      right: true,
    },
    message: "{{ai.title}} 已润色完成，请确认发布对象和日期。",
  },
  {
    id: "contract-summary",
    name: "合同摘要提取",
    description: "粘贴合同条款，提取主体、金额、期限、义务和风险提示。",
    office: {
      taskType: "contract",
      title: "客户服务合同摘要",
      audience: "业务负责人",
      department: "法务/商务",
      style: "审慎专业",
      inputText: OFFICE_TASKS.contract.defaultInput,
    },
    condition: {
      left: "ai.ready",
      operator: "===",
      right: true,
    },
    message: "{{ai.title}} 已完成，请交由负责人复核风险条款。",
  },
  {
    id: "data-summary",
    name: "数据统计助手",
    description: "把业务数据或表格描述转成管理层可读的指标摘要。",
    office: {
      taskType: "data",
      title: "业务数据摘要",
      audience: "管理层",
      department: "运营部",
      style: "数据导向",
      inputText: OFFICE_TASKS.data.defaultInput,
    },
    condition: {
      left: "ai.ready",
      operator: "===",
      right: true,
    },
    message: "{{ai.title}} 已完成，建议补充原始表格后归档。",
  },
  {
    id: "research-brief",
    name: "信息检索助手",
    description: "整理外部资料或内部信息，生成可汇报的要点和建议。",
    office: {
      taskType: "research",
      title: "行业信息简报",
      audience: "业务负责人",
      department: "市场部",
      style: "决策参考",
      inputText: OFFICE_TASKS.research.defaultInput,
    },
    condition: {
      left: "ai.ready",
      operator: "===",
      right: true,
    },
    message: "{{ai.title}} 已生成，适合放入汇报材料。",
  },
];

OFFICE_TASKS.format = {
  label: "\u683c\u5f0f/\u5185\u5bb9\u4fee\u6b63",
  description: "\u6309\u516c\u53f8\u56fa\u5b9a\u6587\u6863\u683c\u5f0f\u4fee\u6b63\u6587\u7a3f\uff0c\u6307\u51fa\u683c\u5f0f\u504f\u5dee\u3001\u7f3a\u5931\u8981\u7d20\u548c\u9519\u522b\u5b57\u3002",
  inputLabel: "\u5f85\u4fee\u6b63\u6587\u6863",
  assistantLabel: "\u6821\u683c\u52a9\u624b",
  panelTitle: "\u6587\u6863\u6821\u683c",
  workbenchTitle: "\u586b\u5199\u5f85\u4fee\u6b63\u6587\u6863",
  materialTitle: "\u6587\u6863\u6750\u6599",
  uploadTitle: "\u4e0a\u4f20\u6587\u6863\u6216\u624b\u52a8\u7c98\u8d34",
  uploadHint: "\u652f\u6301 Word(.docx)\u3001Excel(.xlsx/.xlsm)\u3001\u6587\u672c\u548c CSV\uff1bPDF \u8f83\u5927\u65f6\u5efa\u8bae\u590d\u5236\u6587\u672c\u7c98\u8d34",
  textareaPlaceholder: "\u5728\u8fd9\u91cc\u7c98\u8d34\u9700\u8981\u7edf\u4e00\u683c\u5f0f\u3001\u4fee\u6b63\u5185\u5bb9\u548c\u68c0\u67e5\u9519\u522b\u5b57\u7684\u6587\u7a3f",
  actionLabel: "\u4fee\u6b63\u6587\u6863",
  titlePlaceholder: "\u4f8b\u5982\uff1a\u5ba2\u6237\u8d44\u6599\u5f52\u6863\u901a\u77e5",
  defaultInput:
    "\u5404\u90e8\u95e8\u8fd9\u5468\u628a\u5ba2\u6237\u8d44\u6599\u6574\u7406\u4e00\u4e0b\uff0c\u683c\u5f0f\u5c3d\u91cf\u7edf\u4e00\uff0c\u5468\u4e94\u524d\u7ed9\u529e\u516c\u5ba4\u3002\u540e\u9762\u8981\u505a\u5ba2\u6237\u4fe1\u606f\u5f52\u6863\uff0c\u7f3a\u7684\u5b57\u6bb5\u8981\u8865\u9f50\u3002",
};

FALLBACK_TEMPLATES.splice(2, 0, {
  id: "format-correction",
  name: "\u683c\u5f0f/\u5185\u5bb9\u4fee\u6b63",
  description: "\u6309\u516c\u53f8\u56fa\u5b9a\u6587\u6863\u683c\u5f0f\u4fee\u6b63\u6587\u7a3f\uff0c\u6307\u51fa\u683c\u5f0f\u504f\u5dee\u3001\u7f3a\u5931\u8981\u7d20\u548c\u9519\u522b\u5b57\u3002",
  office: {
    taskType: "format",
    title: "\u6587\u6863\u683c\u5f0f\u4e0e\u5185\u5bb9\u4fee\u6b63",
    audience: "\u63d0\u4ea4\u90e8\u95e8",
    department: "\u603b\u7ecf\u7406\u529e\u516c\u5ba4",
    style: "\u516c\u53f8\u6807\u51c6\u6587\u6863",
    inputText: OFFICE_TASKS.format.defaultInput,
  },
  condition: { left: "ai.ready", operator: "===", right: true },
  message: "{{ai.title}} \u5df2\u4fee\u6b63\u5b8c\u6210\uff0c\u8bf7\u590d\u6838\u683c\u5f0f\u95ee\u9898\u548c\u9519\u522b\u5b57\u6e05\u5355\u3002",
});

const state = {
  templates: [],
  workflows: [],
  activeTemplateId: null,
  activeWorkflowId: null,
  staticMode: false,
  scenarioMode: "office",
  lastOutput: {},
  lastLogs: [],
  lastStatus: "待机",
  lastMessage: "还没有选择流程",
  aiProfiles: [],
  activeAiProfileId: null,
  conversations: [],
  activeConversationId: null,
  chatMessages: [],
};

function parseKeyValueLines(value) {
  return Object.fromEntries(
    String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("=");
        if (separator === -1) {
          return [line, ""];
        }
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

function stringifyKeyValue(object) {
  return Object.entries(object || {})
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function parseConditionRight(value) {
  const text = String(value || "").trim();
  if (text === "true") return true;
  if (text === "false") return false;
  if (text !== "" && !Number.isNaN(Number(text))) return Number(text);
  return text;
}

function getScenarioMode(templateId) {
  return OFFICE_TEMPLATE_TYPES[templateId] || SCENARIO_DEFAULTS.office.taskType;
}

function getActiveOfficeTask() {
  return OFFICE_TASKS[getScenarioMode(state.activeTemplateId)] || OFFICE_TASKS.meeting;
}

function readAiSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(AI_CONFIG_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function writeAiSettings(settings) {
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(settings));
}

function readJsonStorage(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return saved ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function aiSettingsFromForm() {
  const provider = AI_PROVIDER_PRESETS[dom.aiProviderSelect.value] ? dom.aiProviderSelect.value : "openai";
  return {
    id: state.activeAiProfileId,
    name: dom.aiProfileNameInput.value.trim(),
    provider,
    baseUrl: dom.aiBaseUrlInput.value.trim(),
    model: dom.aiModelInput.value.trim(),
    apiKey: dom.aiApiKeyInput.value.trim(),
    contextInput: dom.aiContextInput.value.trim(),
    contextOutput: dom.aiContextOutput.value.trim(),
    toolRounds: dom.aiToolRounds.value.trim(),
  };
}

function defaultProfileName(provider = dom.aiProviderSelect.value, model = dom.aiModelInput.value.trim()) {
  const preset = AI_PROVIDER_PRESETS[provider] || AI_PROVIDER_PRESETS.openai;
  return `${preset.label || provider} / ${model || preset.model || "未选择模型"}`;
}

function updateProfileName(force = false) {
  const nextName = defaultProfileName();
  if (force || !dom.aiProfileNameInput.value.trim() || /^(OpenAI|DeepSeek|Anthropic|阿里云|Kimi) \//.test(dom.aiProfileNameInput.value.trim())) {
    dom.aiProfileNameInput.value = nextName;
  }
}

function activeAiSettings() {
  const selectedProfile = state.aiProfiles.find((profile) => profile.id === dom.agentModelSelect.value);
  if (selectedProfile) return selectedProfile;
  return aiSettingsFromForm();
}

function setAiForm(settings = {}) {
  dom.aiProviderSelect.value = settings.provider || "openai";
  applyProviderPreset(false);
  dom.aiBaseUrlInput.value = settings.baseUrl || dom.aiBaseUrlInput.value;
  dom.aiModelInput.value = settings.model || dom.aiModelInput.value;
  syncModelVersionSelect(dom.aiModelInput.value);
  dom.aiProfileNameInput.value = settings.name || defaultProfileName();
  dom.aiApiKeyInput.value = settings.apiKey || "";
  dom.aiContextInput.value = settings.contextInput || "";
  dom.aiContextOutput.value = settings.contextOutput || "";
  dom.aiToolRounds.value = settings.toolRounds || "";
  updateAiConfigStatus();
}

function renderProviderGrid() {
  dom.providerGrid.innerHTML = Object.entries(AI_PROVIDER_PRESETS)
    .map(
      ([provider, preset]) => `
        <button class="provider-card ${provider === dom.aiProviderSelect.value ? "is-active" : ""}" type="button" data-provider="${provider}">
          <span>${escapeHtml((preset.label || provider).slice(0, 2))}</span>
          <strong>${escapeHtml(preset.label || provider)}</strong>
          <em>⌄</em>
        </button>
      `,
    )
    .join("");
}

function syncModelVersionSelect(selectedModel = "") {
  const preset = AI_PROVIDER_PRESETS[dom.aiProviderSelect.value] || AI_PROVIDER_PRESETS.openai;
  const models = preset.models || [];
  dom.aiModelVersionSelect.innerHTML = models
    .map(
      (model) =>
        `<option value="${escapeHtml(model)}" ${model === selectedModel ? "selected" : ""}>${escapeHtml(model)}</option>`,
    )
    .join("");
  if (selectedModel && !models.includes(selectedModel)) {
    dom.aiModelVersionSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHtml(selectedModel)}" selected>${escapeHtml(selectedModel)}</option>`,
    );
  }
}

function updateProviderConfigTitle() {
  const preset = AI_PROVIDER_PRESETS[dom.aiProviderSelect.value] || AI_PROVIDER_PRESETS.openai;
  dom.providerConfigTitle.textContent = preset.label || "自定义模型";
  dom.providerConfigHint.textContent = "选择模型版本并填写 API Key";
  renderProviderGrid();
}

function openModelModal() {
  renderProviderGrid();
  updateProviderConfigTitle();
  dom.modelModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("model-modal-open");
}

function closeModelModal() {
  dom.modelModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("model-modal-open");
}

function renderAiProfiles() {
  if (!state.aiProfiles.length) {
    dom.aiProfileList.innerHTML = '<p class="muted compact-empty">还没有保存的模型。</p>';
  } else {
    dom.aiProfileList.innerHTML = state.aiProfiles
      .map(
        (profile) => `
          <button class="compact-item ${profile.id === state.activeAiProfileId ? "is-active" : ""}" type="button" data-ai-profile-id="${profile.id}">
            <strong>${escapeHtml(profile.name || profile.model || "未命名模型")}</strong>
            <span>${escapeHtml(profile.provider)} · ${escapeHtml(profile.model || "未填写模型")}</span>
          </button>
        `,
      )
      .join("");
  }

  dom.agentModelSelect.innerHTML = [
    `<option value="">当前表单模型</option>`,
    ...state.aiProfiles.map(
      (profile) =>
        `<option value="${escapeHtml(profile.id)}" ${profile.id === state.activeAiProfileId ? "selected" : ""}>${escapeHtml(profile.name || profile.model)}</option>`,
    ),
  ].join("");
}

function saveAiProfiles() {
  writeJsonStorage(AI_PROFILES_STORAGE_KEY, state.aiProfiles);
  localStorage.setItem(AI_ACTIVE_PROFILE_STORAGE_KEY, state.activeAiProfileId || "");
  renderAiProfiles();
}

function saveAiProfile() {
  const settings = aiSettingsFromForm();
  const id = state.activeAiProfileId || createId("model");
  const profile = {
    ...settings,
    id,
    name: settings.name || `${settings.provider} / ${settings.model || "未命名"}`,
  };
  const index = state.aiProfiles.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.aiProfiles[index] = profile;
  } else {
    state.aiProfiles.push(profile);
  }
  state.activeAiProfileId = id;
  setAiForm(profile);
  writeAiSettings(profile);
  saveAiProfiles();
}

function deleteAiProfile() {
  if (!state.activeAiProfileId) return;
  state.aiProfiles = state.aiProfiles.filter((profile) => profile.id !== state.activeAiProfileId);
  state.activeAiProfileId = state.aiProfiles[0]?.id || null;
  const nextProfile = state.aiProfiles.find((profile) => profile.id === state.activeAiProfileId);
  if (nextProfile) {
    setAiForm(nextProfile);
    writeAiSettings(nextProfile);
  } else {
    setAiForm({});
    writeAiSettings(aiSettingsFromForm());
  }
  saveAiProfiles();
}

function selectAiProfile(profileId) {
  const profile = state.aiProfiles.find((item) => item.id === profileId);
  if (!profile) return;
  state.activeAiProfileId = profile.id;
  setAiForm(profile);
  writeAiSettings(profile);
  saveAiProfiles();
}

function loadAiProfiles() {
  state.aiProfiles = readJsonStorage(AI_PROFILES_STORAGE_KEY, []);
  state.activeAiProfileId =
    localStorage.getItem(AI_ACTIVE_PROFILE_STORAGE_KEY) || state.aiProfiles[0]?.id || null;
}

renderChatMessages = function () {
  const messages = state.chatMessages.length
    ? state.chatMessages
    : [
        {
          role: "assistant",
          content:
            "你好，我可以帮你整理会议纪要、润色通知、提取合同要点、分析表格数据，或者先和你一起梳理办公需求。",
          name: "OfficeFlow AI",
        },
      ];

  dom.agentChatMessages.innerHTML = messages
    .map(
      (message) => `
        <article class="agent-message ${message.role === "user" ? "user" : "assistant"}">
          <span>${escapeHtml(message.name || (message.role === "user" ? "你" : "OfficeFlow AI"))}</span>
          <p>${escapeHtml(message.content || "")}</p>
        </article>
      `,
    )
    .join("");
};

getConversationTitle = function (conversation) {
  const firstUser = conversation.messages.find((message) => message.role === "user");
  return firstUser?.content?.slice(0, 22) || conversation.title || "新对话";
};

renderConversations = function () {
  if (!state.conversations.length) {
    dom.conversationList.innerHTML = '<p class="muted compact-empty">还没有对话记录。</p>';
    return;
  }

  dom.conversationList.innerHTML = state.conversations
    .map(
      (conversation) => `
        <div class="compact-item conversation-item ${conversation.id === state.activeConversationId ? "is-active" : ""}" data-conversation-id="${conversation.id}">
          <button class="conversation-main" type="button" data-conversation-id="${conversation.id}">
            <strong>${escapeHtml(getConversationTitle(conversation))}</strong>
            <span>${escapeHtml(new Date(conversation.updatedAt).toLocaleString())}</span>
          </button>
          <button class="conversation-delete" type="button" data-delete-conversation-id="${conversation.id}" aria-label="删除对话">删除</button>
        </div>
      `,
    )
    .join("");
};

function saveConversations() {
  writeJsonStorage(CONVERSATION_STORAGE_KEY, state.conversations);
  localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, state.activeConversationId || "");
  renderConversations();
}

function currentConversation() {
  return state.conversations.find((item) => item.id === state.activeConversationId);
}

syncActiveConversation = function () {
  const conversation = currentConversation();
  if (!conversation) return;
  conversation.messages = state.chatMessages;
  conversation.updatedAt = new Date().toISOString();
  saveConversations();
};

createConversation = function () {
  const conversation = {
    id: createId("chat"),
    title: "新对话",
    messages: [],
    updatedAt: new Date().toISOString(),
  };
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.chatMessages = [];
  renderChatMessages();
  saveConversations();
};

function selectConversation(conversationId) {
  const conversation = state.conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  state.activeConversationId = conversation.id;
  state.chatMessages = conversation.messages || [];
  renderChatMessages();
  saveConversations();
}

function summarizeTextForTitle(text = "") {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 22);
}

appendWorkflowRunToConversations = function ({ prompt, output }) {
  const title = summarizeTextForTitle(prompt) || output?.title || "办公处理结果";
  const summary = output?.summary ? `\n\n摘要：${output.summary}` : "";
  const todos = Array.isArray(output?.todos)
    ? `\n\n待办：\n${output.todos
        .map((todo) => `- ${todo.owner || "负责人"}：${todo.item || ""}${todo.due ? `（${todo.due}）` : ""}`)
        .join("\n")}`
    : "";
  const conversation = {
    id: createId("chat"),
    title,
    updatedAt: new Date().toISOString(),
    messages: [
      { role: "user", content: prompt || title, name: "你" },
      {
        role: "assistant",
        content: `${output?.title || "办公处理结果"}${summary}${todos}`,
        name: output?.modelProvider || "OfficeFlow AI",
      },
    ],
  };
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.chatMessages = conversation.messages;
  renderChatMessages();
  saveConversations();
};

deleteConversation = function (conversationId) {
  const index = state.conversations.findIndex((item) => item.id === conversationId);
  if (index === -1) return;
  state.conversations.splice(index, 1);

  if (state.activeConversationId === conversationId) {
    state.activeConversationId =
      state.conversations[Math.max(0, index - 1)]?.id || state.conversations[0]?.id || null;
    if (state.activeConversationId) {
      state.chatMessages =
        state.conversations.find((item) => item.id === state.activeConversationId)?.messages || [];
    } else {
      createConversation();
      return;
    }
    renderChatMessages();
  }

  saveConversations();
};

loadConversations = function () {
  state.conversations = readJsonStorage(CONVERSATION_STORAGE_KEY, []);
  state.activeConversationId =
    localStorage.getItem(ACTIVE_CONVERSATION_STORAGE_KEY) || state.conversations[0]?.id || null;
  if (!state.activeConversationId) {
    createConversation();
    return;
  }
  const conversation = currentConversation();
  state.chatMessages = conversation?.messages || [];
  renderChatMessages();
  renderConversations();
};

function updateAiConfigStatus() {
  const settings = aiSettingsFromForm();
  const isConfigured = Boolean(settings.baseUrl && settings.model && settings.apiKey);
  dom.aiConfigStatus.textContent = isConfigured ? "已配置" : "未配置";
  dom.aiConfigStatus.classList.toggle("is-ready", isConfigured);
}

function applyProviderPreset(force = false) {
  const preset = AI_PROVIDER_PRESETS[dom.aiProviderSelect.value] || AI_PROVIDER_PRESETS.openai;
  if (force || !dom.aiBaseUrlInput.value.trim()) {
    dom.aiBaseUrlInput.value = preset.baseUrl;
  }
  if (force || !dom.aiModelInput.value.trim()) {
    dom.aiModelInput.value = preset.model;
  }
  syncModelVersionSelect(dom.aiModelInput.value.trim());
  updateProfileName(force);
  updateProviderConfigTitle();
}

function loadAiConfig() {
  loadAiProfiles();
  const activeProfile = state.aiProfiles.find((item) => item.id === state.activeAiProfileId);
  setAiForm(activeProfile || readAiSettings());
  renderAiProfiles();
}

function handleAiConfigChange(event) {
  if (event.target === dom.aiProviderSelect) {
    applyProviderPreset(true);
  }
  writeAiSettings(aiSettingsFromForm());
  updateAiConfigStatus();
  renderAiProfiles();
}

function setScenarioCopy(task, badge) {
  const title = task.label;
  const hint = task.description;
  if (dom.scenarioPanelEyebrow) dom.scenarioPanelEyebrow.textContent = task.assistantLabel;
  if (dom.scenarioPanelTitle) dom.scenarioPanelTitle.textContent = task.panelTitle;
  dom.scenarioTitle.textContent = title;
  dom.scenarioHint.textContent = hint;
  dom.scenarioModeBadge.textContent = badge;
  dom.runWorkflowButton.lastChild.textContent = ` ${task.actionLabel}`;
}

function parseOfficeBody() {
  try {
    const parsed = JSON.parse(dom.bodyInput.value || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function inferOfficeScenarioFromForm(taskType = SCENARIO_DEFAULTS.office.taskType) {
  return {
    ...SCENARIO_DEFAULTS.office,
    taskType,
    ...parseOfficeBody(),
  };
}

function renderScenarioFields(template, options = {}) {
  const taskType = getScenarioMode(template?.id);
  state.scenarioMode = "office";
  dom.advancedConfig.open = false;
  const scenario = options.inferFromForm
    ? inferOfficeScenarioFromForm(taskType)
    : {
        ...SCENARIO_DEFAULTS.office,
        ...(template?.office || {}),
        taskType,
      };
  const task = OFFICE_TASKS[scenario.taskType] || OFFICE_TASKS.meeting;

  setScenarioCopy(task, "固定模板");
  dom.scenarioFields.innerHTML = `
    <section class="material-input-card scenario-wide" aria-label="${escapeHtml(task.materialTitle)}">
      <div class="material-card-head">
        <div>
          <span class="section-label">${escapeHtml(task.materialTitle)}</span>
          <strong>${escapeHtml(task.uploadTitle)}</strong>
        </div>
        <div class="upload-format-row" aria-label="支持格式">
          <span>Word .docx</span>
          <span>PDF</span>
          <span>Excel .xlsx</span>
          <span>文本/CSV</span>
        </div>
      </div>
      <label class="file-drop-zone" for="scenarioFileInput" id="scenarioDropZone">
        <input id="scenarioFileInput" type="file" accept=".txt,.md,.csv,.json,.log,.docx,.pdf,.xlsx,.xlsm,.xltx" />
        <span>拖入文件到这里，或点击选择文件</span>
        <small id="scenarioFileStatus">${escapeHtml(task.uploadHint)}</small>
      </label>
      <textarea id="scenarioInput" spellcheck="false" placeholder="${escapeHtml(task.textareaPlaceholder)}">${escapeHtml(scenario.inputText || task.defaultInput)}</textarea>
    </section>
    <label class="field">
      <span>标题</span>
      <input id="scenarioTitleInput" type="text" value="${escapeHtml(scenario.title)}" placeholder="${escapeHtml(task.titlePlaceholder)}" />
    </label>
    <label class="field">
      <span>面向对象</span>
      <input id="scenarioAudience" type="text" value="${escapeHtml(scenario.audience)}" placeholder="例如：总经理 / 项目组" />
    </label>
    <label class="field">
      <span>所属部门</span>
      <input id="scenarioDepartment" type="text" value="${escapeHtml(scenario.department)}" placeholder="例如：总经理办公室" />
    </label>
  `;
}

function officeConfigFromScenario() {
  const taskType = getScenarioMode(state.activeTemplateId);
  const task = OFFICE_TASKS[taskType] || OFFICE_TASKS.meeting;

  return {
    taskType,
    title:
      dom.scenarioFields.querySelector("#scenarioTitleInput")?.value.trim() ||
      task.label,
    audience:
      dom.scenarioFields.querySelector("#scenarioAudience")?.value.trim() ||
      "团队成员",
    department:
      dom.scenarioFields.querySelector("#scenarioDepartment")?.value.trim() ||
      "总经理办公室",
    style: "正式规范、数据导向、决策参考",
    inputText:
      dom.scenarioFields.querySelector("#scenarioInput")?.value.trim() ||
      task.defaultInput,
  };
}

function syncOfficeScenario() {
  const config = officeConfigFromScenario();
  const task = OFFICE_TASKS[config.taskType] || OFFICE_TASKS.meeting;

  dom.workflowName.value = config.title || task.label;
  dom.methodSelect.value = "POST";
  dom.urlInput.value = "https://officeflow.local/mock-ai";
  dom.queryInput.value = "";
  dom.headersInput.value = stringifyKeyValue({
    "Content-Type": "application/json",
  });
  dom.bodyInput.value = JSON.stringify(config, null, 2);
  dom.outputMapInput.value = stringifyKeyValue({
    title: "title",
    summary: "summary",
    estimatedMinutesSaved: "metrics.estimatedMinutesSaved",
    nextStepCount: "metrics.nextStepCount",
  });
  dom.conditionLeft.value = "ai.ready";
  dom.conditionOperator.value = "===";
  dom.conditionRight.value = "true";
  dom.messageInput.value = "{{ai.title}} 已生成，建议复核后发送给{{ai.audience}}。";
  renderMeta();
}

function syncScenarioToAdvanced() {
  syncOfficeScenario();
}

function requestConfigFromForm() {
  return {
    method: dom.methodSelect.value,
    url: dom.urlInput.value.trim(),
    query: parseKeyValueLines(dom.queryInput.value),
    headers: parseKeyValueLines(dom.headersInput.value),
    body: dom.bodyInput.value,
    outputMap: parseKeyValueLines(dom.outputMapInput.value),
  };
}

function officeConfigFromForm() {
  return {
    ...SCENARIO_DEFAULTS.office,
    ...officeConfigFromScenario(),
    ...parseOfficeBody(),
  };
}

function workflowFromForm() {
  const workflowSlug =
    dom.workflowName.value
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") ||
    state.activeTemplateId ||
    "custom";
  const workflowId =
    state.activeWorkflowId ||
    `workflow-${workflowSlug}-${Date.now().toString(36)}`;

  return {
    id: workflowId,
    name: dom.workflowName.value.trim() || "AI 办公流程",
    templateId: state.activeTemplateId,
    nodes: [
      { id: "trigger", type: "manualTrigger", label: "提交任务" },
      {
        id: "api",
        type: "aiOfficeTask",
        label: "AI 处理节点",
        config: officeConfigFromForm(),
      },
      {
        id: "condition",
        type: "condition",
        label: "复核条件",
        config: {
          condition: {
            left: dom.conditionLeft.value.trim(),
            operator: dom.conditionOperator.value,
            right: parseConditionRight(dom.conditionRight.value),
          },
        },
      },
      {
        id: "notify",
        type: "notify",
        label: "完成提醒",
        config: {
          when: "condition",
          message: dom.messageInput.value.trim(),
        },
      },
    ],
  };
}

function sortedObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortedObject);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, item]) => [key, sortedObject(item)]),
    );
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortedObject(value));
}

function getWorkflowNode(workflow, nodeId) {
  return workflow?.nodes?.find((node) => node.id === nodeId);
}

function workflowDedupeSignature(workflow) {
  const apiNode = getWorkflowNode(workflow, "api");
  const apiConfig = apiNode?.config || {};
  const condition = getWorkflowNode(workflow, "condition")?.config?.condition || {};
  if (apiNode?.type === "aiOfficeTask") {
    return stableStringify({
      templateId: workflow.templateId || "document-minutes",
      ai: apiConfig,
      condition: {
        left: condition.left || "",
        operator: condition.operator || "",
        right: condition.right ?? "",
      },
    });
  }

  return stableStringify({
    templateId: workflow.templateId || "custom-api",
    request: {
      method: apiConfig.method || "GET",
      url: apiConfig.url || "",
      query: apiConfig.query || {},
      headers: apiConfig.headers || {},
      body: apiConfig.body || "",
      outputMap: apiConfig.outputMap || {},
    },
    condition: {
      left: condition.left || "",
      operator: condition.operator || "",
      right: condition.right ?? "",
    },
  });
}

function workflowContentSignature(workflow) {
  const notifyMessage = getWorkflowNode(workflow, "notify")?.config?.message || "";
  return stableStringify({
    name: workflow.name || "",
    dedupe: workflowDedupeSignature(workflow),
    message: notifyMessage,
  });
}

function findDuplicateWorkflow(workflow) {
  const signature = workflowDedupeSignature(workflow);
  return state.workflows.find((item) => workflowDedupeSignature(item) === signature);
}

function findExactWorkflow(workflow) {
  const signature = workflowContentSignature(workflow);
  return state.workflows.find((item) => workflowContentSignature(item) === signature);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStaticWorkflows() {
  try {
    const saved = JSON.parse(localStorage.getItem("mini-zapier-static-workflows") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeStaticWorkflows(workflows) {
  localStorage.setItem("mini-zapier-static-workflows", JSON.stringify(workflows));
}

function setWorkbenchOpen(isOpen) {
  document.body.classList.toggle("workbench-open", isOpen);
  dom.workbenchShell.setAttribute("aria-hidden", String(!isOpen));
}

function scrollToScenarioInput(options = {}) {
  const target =
    dom.scenarioFields.querySelector(".material-input-card") ||
    dom.scenarioFields ||
    dom.workbenchShell;
  const offset = window.matchMedia("(max-width: 640px)").matches ? 12 : 24;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top, behavior: options.behavior || "smooth" });
  window.setTimeout(() => {
    dom.scenarioFields.querySelector("#scenarioInput")?.focus({ preventScroll: true });
  }, options.focusDelay ?? 120);
}

function openWorkbench(options = {}) {
  setWorkbenchOpen(true);
  requestAnimationFrame(() => {
    if (options.focusMaterial) {
      requestAnimationFrame(() => {
        scrollToScenarioInput({ behavior: "auto", focusDelay: 0 });
      });
      window.setTimeout(() => {
        scrollToScenarioInput({ behavior: "smooth", focusDelay: 180 });
      }, 380);
      return;
    }
    dom.workbenchShell.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

function closeWorkbench() {
  setWorkbenchOpen(false);
}

function openInspector() {
  document.body.classList.add("inspector-open");
  dom.inspectorPanel.setAttribute("aria-hidden", "false");
}

function closeInspector() {
  document.body.classList.remove("inspector-open");
  dom.inspectorPanel.setAttribute("aria-hidden", "true");
}

function toggleInspector() {
  if (document.body.classList.contains("inspector-open")) {
    closeInspector();
  } else {
    openInspector();
  }
}

function closeFloatingSurfaces() {
  closeInspector();
  closeWorkbench();
}

function updateFavoriteButton() {
  if (!dom.favoriteWorkflowButton) return;
  const isFavorited = Boolean(state.activeWorkflowId);
  dom.favoriteWorkflowButton.classList.toggle("is-favorited", isFavorited);
  dom.favoriteWorkflowButton.setAttribute("aria-pressed", String(isFavorited));
  dom.favoriteWorkflowButton.setAttribute(
    "aria-label",
    isFavorited ? "取消收藏流程" : "收藏流程",
  );
  dom.favoriteWorkflowButton.title = isFavorited ? "取消收藏流程" : "收藏流程";
}

function refreshFavoriteStateFromForm() {
  const exactWorkflow = findExactWorkflow(workflowFromForm());
  state.activeWorkflowId = exactWorkflow?.id || null;
  updateFavoriteButton();
}

function markWorkflowDirty() {
  refreshFavoriteStateFromForm();
  renderDashboard();
}

function applyTemplate(template) {
  state.activeTemplateId = template.id;
  state.activeWorkflowId = null;
  dom.activeTemplateBadge.textContent = template.name;
  dom.workflowName.value = template.name;
  dom.methodSelect.value = "POST";
  dom.urlInput.value = "https://officeflow.local/mock-ai";
  dom.queryInput.value = "";
  dom.headersInput.value = stringifyKeyValue({ "Content-Type": "application/json" });
  dom.bodyInput.value = JSON.stringify(template.office || SCENARIO_DEFAULTS.office, null, 2);
  dom.outputMapInput.value = stringifyKeyValue({
    title: "title",
    summary: "summary",
    estimatedMinutesSaved: "metrics.estimatedMinutesSaved",
    nextStepCount: "metrics.nextStepCount",
  });
  dom.conditionLeft.value = template.condition.left;
  dom.conditionOperator.value = template.condition.operator;
  dom.conditionRight.value = String(template.condition.right);
  dom.messageInput.value = template.message;
  renderScenarioFields(template);
  syncScenarioToAdvanced();
  renderMeta();
  resetStatuses();
  setResult("准备就绪", template.description || "模板已载入。");
  renderOutput({});
  closeInspector();
  openWorkbench({ focusMaterial: true });
  refreshFavoriteStateFromForm();
}

function applyWorkflow(workflow) {
  const apiNode = workflow.nodes.find((node) => node.id === "api");
  const conditionNode = workflow.nodes.find((node) => node.id === "condition");
  const notifyNode = workflow.nodes.find((node) => node.id === "notify");

  state.activeWorkflowId = workflow.id;
  state.activeTemplateId = workflow.templateId || "document-minutes";
  dom.activeTemplateBadge.textContent = getActiveOfficeTask().label;
  dom.workflowName.value = workflow.name;
  if (apiNode?.type === "aiOfficeTask") {
    dom.methodSelect.value = "POST";
    dom.urlInput.value = "https://officeflow.local/mock-ai";
    dom.queryInput.value = "";
    dom.headersInput.value = stringifyKeyValue({ "Content-Type": "application/json" });
    dom.bodyInput.value = JSON.stringify(apiNode.config || SCENARIO_DEFAULTS.office, null, 2);
    dom.outputMapInput.value = stringifyKeyValue({
      title: "title",
      summary: "summary",
      estimatedMinutesSaved: "metrics.estimatedMinutesSaved",
      nextStepCount: "metrics.nextStepCount",
    });
  } else {
    dom.methodSelect.value = apiNode?.config?.method || "GET";
    dom.urlInput.value = apiNode?.config?.url || "";
    dom.queryInput.value = stringifyKeyValue(apiNode?.config?.query);
    dom.headersInput.value = stringifyKeyValue(apiNode?.config?.headers);
    dom.bodyInput.value = apiNode?.config?.body || "";
    dom.outputMapInput.value = stringifyKeyValue(apiNode?.config?.outputMap);
  }
  dom.conditionLeft.value = conditionNode?.config?.condition?.left || "ai.ready";
  dom.conditionOperator.value = conditionNode?.config?.condition?.operator || "===";
  dom.conditionRight.value = String(conditionNode?.config?.condition?.right ?? true);
  dom.messageInput.value = notifyNode?.config?.message || "";
  renderScenarioFields(
    state.templates.find((item) => item.id === state.activeTemplateId) || {
      id: state.activeTemplateId,
      name: workflow.name,
    },
    { inferFromForm: true },
  );
  renderMeta();
  resetStatuses();
  setResult("流程已载入", "你可以继续编辑、预览或运行这个已收藏流程。");
  closeInspector();
  openWorkbench({ focusMaterial: true });
  refreshFavoriteStateFromForm();
}

function renderTemplates() {
  dom.templateList.innerHTML = state.templates
    .map(
      (template) => `
        <button class="template-item ${template.id === state.activeTemplateId ? "is-active" : ""}" type="button" data-template-id="${template.id}">
          <strong>${escapeHtml(template.name)}</strong>
          <span>${escapeHtml(template.description)}</span>
        </button>
      `,
    )
    .join("");
}

function renderWorkflows() {
  if (!state.workflows.length) {
    dom.workflowList.innerHTML = '<p class="muted">还没有收藏的办公流程。</p>';
  } else {
    dom.workflowList.innerHTML = state.workflows
      .map(
        (workflow) => `
          <button class="saved-item" type="button" data-workflow-id="${workflow.id}">
            <strong>${escapeHtml(workflow.name)}</strong>
            <span>${escapeHtml(workflow.id)}</span>
          </button>
        `,
      )
      .join("");
  }
  renderDashboard();
  refreshFavoriteStateFromForm();
}

function renderMeta() {
  const config = parseOfficeBody();
  const task = OFFICE_TASKS[config.taskType] || OFFICE_TASKS[getScenarioMode(state.activeTemplateId)];
  dom.apiNodeMeta.textContent = `生成：${task?.label || "AI 办公结果"}`;
  dom.conditionNodeMeta.textContent = `${dom.conditionLeft.value || "ai.ready"} ${dom.conditionOperator.value} ${dom.conditionRight.value}`;
  dom.notifyNodeMeta.textContent = dom.messageInput.value || "还没有配置完成提示。";
  renderDashboard();
}

function formatMetricValue(value) {
  if (value == null || value === "") return "空";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function renderListItems(items = []) {
  if (!items.length) return '<li>暂无</li>';
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderTodoItems(items = []) {
  if (!items.length) return '<li>暂无待办</li>';
  return items
    .map((item) => {
      if (typeof item === "string") return `<li>${escapeHtml(item)}</li>`;
      const owner = item.owner ? `<strong>${escapeHtml(item.owner)}</strong>` : "";
      const due = item.due ? `<em>${escapeHtml(item.due)}</em>` : "";
      return `
        <li>
          <span>${owner}${escapeHtml(item.item || "")}</span>
          ${due}
        </li>
      `;
    })
    .join("");
}

function renderOptionalResultSection(title, content) {
  if (!content) return "";
  if (Array.isArray(content)) {
    return `
      <section class="result-section">
        <h4>${escapeHtml(title)}</h4>
        <ul>${renderListItems(content)}</ul>
      </section>
    `;
  }
  return `
    <section class="result-section polished-draft">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(content)}</p>
    </section>
  `;
}

exportFormatsForTask = function (taskType = "") {
  const normalized = String(taskType || "").toLowerCase();
  if (normalized === "data") return ["xlsx", "pdf"];
  if (normalized === "contract") return ["docx", "xlsx"];
  return ["docx", "pdf"];
};

renderExportActions = function (output) {
  const formats = exportFormatsForTask(output.taskType);
  const labels = {
    docx: "导出 Word",
    pdf: "导出 PDF",
    xlsx: "导出 Excel",
  };
  return `
    <div class="export-actions" aria-label="导出文件">
      ${formats
        .map(
          (format) =>
            `<button type="button" data-export-format="${format}">${labels[format] || `导出 ${format.toUpperCase()}`}</button>`,
        )
        .join("")}
    </div>
  `;
};

function renderOutputVariants(variants = []) {
  if (!Array.isArray(variants) || !variants.length) return "";
  return `
    <section class="result-section output-variants">
      <h4>输出版本</h4>
      <div>
        ${variants
          .map(
            (variant) => `
              <article>
                <strong>${escapeHtml(variant.style || "版本")}</strong>
                <p>${escapeHtml(variant.content || "")}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

renderOfficeResult = function (output) {
  const keyPoints = Array.isArray(output.keyPoints) ? output.keyPoints : [];
  const todos = Array.isArray(output.todos) ? output.todos : [];
  const labels = sceneResultLabels(output.taskType);
  const extraSections = [
    renderOptionalResultSection("润色稿", output.polishedDraft),
    renderOptionalResultSection("风险提示", output.riskItems),
  ].join("");

  return `
    <article class="office-result-card">
      <div class="office-result-head">
        <div>
          <span class="section-label">${escapeHtml(output.taskType || "AI 结果")}</span>
          <h3>${escapeHtml(output.title || "办公处理结果")}</h3>
        </div>
        <div class="result-head-actions">
          <span class="result-status">${output.ready ? "可复核" : "待处理"}</span>
          ${renderExportActions(output)}
        </div>
      </div>

      <section class="result-section result-summary">
        <h4>摘要</h4>
        <p>${escapeHtml(output.summary || "暂无摘要。")}</p>
      </section>

      <div class="result-columns">
        <section class="result-section">
          <h4>关键要点</h4>
          <ul>${renderListItems(keyPoints)}</ul>
        </section>
        <section class="result-section">
          <h4>待办事项</h4>
          <ul class="todo-result-list">${renderTodoItems(todos)}</ul>
        </section>
      </div>

      ${renderOutputVariants(output.outputVariants)}

      ${extraSections}

      <section class="result-section recommendation">
        <h4>建议</h4>
        <p>${escapeHtml(output.recommendation || "建议人工复核后再发送或归档。")}</p>
      </section>
    </article>
  `;
};

function renderOutput(output) {
  state.lastOutput = output || {};
  dom.outputPreview.textContent = JSON.stringify(state.lastOutput, null, 2);
  renderDashboard();
}

function renderLogs(logs = []) {
  state.lastLogs = logs;
  if (!logs.length) {
    dom.logList.innerHTML = '<li class="empty-log">还没有运行日志。</li>';
    renderDashboard();
    return;
  }

  dom.logList.innerHTML = logs
    .map((log) => {
      const detail = log.error || log.reason || summarizeOutput(log.output);
      return `
        <li>
          <span class="log-badge ${log.status}">${statusLabel(log.status)}</span>
          <span>
            <strong>${escapeHtml(log.label)}</strong>
            <small>${escapeHtml(detail)}</small>
          </span>
        </li>
      `;
    })
    .join("");
  renderDashboard();
}

function renderDashboard() {
  const output = state.lastOutput || {};
  const entries = Object.entries(output);
  const workflowLabel = dom.workflowName?.value?.trim() || "还没有选择流程";
  const metrics = output.metrics || {};
  dom.metricOutputCount.textContent = String(metrics.estimatedMinutesSaved ?? 0);
  dom.metricStatus.textContent = state.lastStatus;
  dom.metricActiveWorkflow.textContent = workflowLabel;
  dom.metricLogCount.textContent = String(Array.isArray(output.todos) ? output.todos.length : 0);
  dom.metricSavedCount.textContent = String(state.workflows.length);

  if (!entries.length) {
    const task = getActiveOfficeTask();
    const emptyResult = `
      <div class="result-empty">
        <strong>等待${escapeHtml(task.actionLabel)}</strong>
        <span>填写或上传${escapeHtml(task.inputLabel)}后点击“${escapeHtml(task.actionLabel)}”。</span>
      </div>
    `;
    dom.outputMetricList.innerHTML = emptyResult;
    if (dom.mainResultPanel) dom.mainResultPanel.innerHTML = emptyResult;
    return;
  }

  if ("summary" in output || "todos" in output || "keyPoints" in output) {
    const resultHtml = renderOfficeResult(output);
    dom.outputMetricList.innerHTML = resultHtml;
    if (dom.mainResultPanel) dom.mainResultPanel.innerHTML = resultHtml;
    return;
  }

  const fallbackHtml = entries
    .slice(0, 8)
    .map(
      ([key, value]) => `
        <span class="output-chip">
          <strong>${escapeHtml(key)}</strong>
          <em>${escapeHtml(formatMetricValue(value))}</em>
        </span>
      `,
    )
    .join("");
  dom.outputMetricList.innerHTML = fallbackHtml;
  if (dom.mainResultPanel) dom.mainResultPanel.innerHTML = fallbackHtml;
}

function summarizeOutput(output) {
  if (!output) return "节点已完成。";
  if ("summary" in output) return output.summary;
  if ("title" in output) return `${output.title} 已生成。`;
  if ("message" in output) return output.message;
  if ("result" in output) return output.result ? "条件成立。" : "条件不成立。";
  if ("status" in output) return `HTTP ${output.status}`;
  if ("triggeredAt" in output) return "手动触发成功。";
  return "节点已完成。";
}

function statusLabel(status) {
  const labels = {
    success: "成功",
    skipped: "跳过",
    error: "错误",
    running: "运行中",
    idle: "待机",
  };
  return labels[status] || status;
}

function setResult(title, message) {
  state.lastStatus = title;
  state.lastMessage = message;
  dom.resultTitle.textContent = title;
  dom.resultMessage.textContent = message;
  renderDashboard();
}

function resetStatuses() {
  Object.values(nodeElements).forEach((node) => {
    node.dataset.status = "idle";
  });
  renderLogs([]);
}

function applyRunLogs(logs = []) {
  resetStatuses();
  logs.forEach((log) => {
    if (nodeElements[log.nodeId]) {
      nodeElements[log.nodeId].dataset.status = log.status;
    }
  });
  renderLogs(logs);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || `Request failed with ${response.status}`);
  }

  return body;
}

async function extractFileViaApi(file) {
  const response = await fetch("/api/extract-file", {
    method: "POST",
    headers: {
      "content-type": "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name),
      "x-file-type": file.type || "application/octet-stream",
    },
    body: file,
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || `Request failed with ${response.status}`);
  }
  return body;
}

const LOCAL_TEXT_PREVIEW_CHARS = 80_000;

async function readLocalTextPreview(file) {
  const text = await file.slice(0, LOCAL_TEXT_PREVIEW_CHARS).text();
  const isPartial = file.size > LOCAL_TEXT_PREVIEW_CHARS;
  return {
    text: isPartial
      ? `${text}\n\n（内容较长，已截取前 ${LOCAL_TEXT_PREVIEW_CHARS} 字用于 AI 分析。）`
      : text,
    note: isPartial ? `内容较长，已截取前 ${LOCAL_TEXT_PREVIEW_CHARS} 字用于 AI 分析。` : "",
  };
}

async function favoriteWorkflow() {
  if (dom.favoriteWorkflowButton) setBusy(dom.favoriteWorkflowButton, true);
  const workflow = workflowFromForm();
  const duplicateWorkflow = findDuplicateWorkflow(workflow);
  const isUpdatingExisting = Boolean(duplicateWorkflow);
  if (duplicateWorkflow) {
    workflow.id = duplicateWorkflow.id;
  }

  try {
    if (state.staticMode) {
      const workflows = readStaticWorkflows();
      const existingIndex = workflows.findIndex((item) => item.id === workflow.id);
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }
      writeStaticWorkflows(workflows);
      state.activeWorkflowId = workflow.id;
      state.workflows = workflows;
      renderWorkflows();
      setResult(
        isUpdatingExisting ? "收藏已更新" : "已收藏到浏览器",
        isUpdatingExisting
          ? `${workflow.name} 已更新到已有收藏，未新增重复项。`
          : `${workflow.name} 已收藏到当前浏览器。`,
      );
      return;
    }

    const body = await apiFetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({ workflow }),
    });
    state.activeWorkflowId = body.workflow.id;
    await loadWorkflows();
    setResult(
      isUpdatingExisting ? "收藏已更新" : "流程已收藏",
      isUpdatingExisting
        ? `${body.workflow.name} 已更新到已有收藏，未新增重复项。`
        : `${body.workflow.name} 已收藏到本地。`,
    );
  } catch (error) {
    setResult("收藏失败", error.message);
  } finally {
    if (dom.favoriteWorkflowButton) setBusy(dom.favoriteWorkflowButton, false);
  }
}

async function unfavoriteWorkflow() {
  const workflowId = state.activeWorkflowId;
  if (!workflowId) return;
  const currentSignature = workflowDedupeSignature(workflowFromForm());
  const workflowIds = state.workflows
    .filter((workflow) => workflowDedupeSignature(workflow) === currentSignature)
    .map((workflow) => workflow.id);
  const idsToDelete = workflowIds.length ? workflowIds : [workflowId];

  if (dom.favoriteWorkflowButton) setBusy(dom.favoriteWorkflowButton, true);

  try {
    if (state.staticMode) {
      const workflows = readStaticWorkflows();
      const nextWorkflows = workflows.filter((workflow) => !idsToDelete.includes(workflow.id));
      writeStaticWorkflows(nextWorkflows);
      state.workflows = nextWorkflows;
      state.activeWorkflowId = null;
      renderWorkflows();
      setResult("已取消收藏", "当前流程已从浏览器收藏中移除。");
      return;
    }

    await Promise.all(
      idsToDelete.map((id) =>
        apiFetch(`/api/workflows/${encodeURIComponent(id)}`, {
          method: "DELETE",
        }),
      ),
    );
    state.activeWorkflowId = null;
    await loadWorkflows();
    setResult("已取消收藏", "当前流程已从本地收藏中移除。");
  } catch (error) {
    setResult("取消收藏失败", error.message);
  } finally {
    if (dom.favoriteWorkflowButton) setBusy(dom.favoriteWorkflowButton, false);
  }
}

async function toggleFavoriteWorkflow() {
  refreshFavoriteStateFromForm();
  if (state.activeWorkflowId) {
    await unfavoriteWorkflow();
    return;
  }
  await favoriteWorkflow();
}

async function runWorkflow() {
  if (state.staticMode) {
    setResult("需要后端服务", STATIC_MODE_MESSAGE);
    openInspector();
    return;
  }

  setBusy(dom.runWorkflowButton, true);
  setResult("流程运行中", "后端正在按顺序执行每个节点。");
  resetStatuses();
  Object.values(nodeElements).forEach((node) => {
    node.dataset.status = "running";
  });

  try {
    const body = await apiFetch("/api/workflows/run", {
      method: "POST",
      body: JSON.stringify({
        workflow: workflowFromForm(),
        aiSettings: activeAiSettings(),
      }),
    });
    applyRunLogs(body.result.logs);
    const output = body.result.context.ai || body.result.context.api?.output || body.result.context.api || {};
    renderOutput(output);
    dom.mainResultPanel?.scrollIntoView({ block: "start", behavior: "smooth" });
    appendWorkflowRunToConversations({
      prompt: officeConfigFromScenario().inputText,
      output,
    });
    await runBrowserActions(body.actions || []);
    setResult("流程已完成", `已处理 ${body.result.logs.length} 个节点。`);
  } catch (error) {
    setResult("流程运行失败", error.message);
    Object.values(nodeElements).forEach((node) => {
      if (node.dataset.status === "running") node.dataset.status = "idle";
    });
  } finally {
    setBusy(dom.runWorkflowButton, false);
  }
}

async function sendAgentChat(event) {
  event.preventDefault();
  const prompt = dom.agentChatInput.value.trim();
  if (!prompt) return;

  state.chatMessages.push({ role: "user", content: prompt, name: "你" });
  const conversation = currentConversation();
  if (conversation && conversation.title === "新对话") {
    conversation.title = summarizeTextForTitle(prompt);
  }
  dom.agentChatInput.value = "";
  renderChatMessages();
  syncActiveConversation();

  if (state.staticMode) {
    state.chatMessages.push({ role: "assistant", content: STATIC_MODE_MESSAGE, name: "OfficeFlow AI" });
    renderChatMessages();
    syncActiveConversation();
    return;
  }

  setBusy(dom.agentChatSendButton, true);
  try {
    const body = await apiFetch("/api/ai-chat", {
      method: "POST",
      body: JSON.stringify({
        messages: state.chatMessages.map(({ role, content }) => ({ role, content })),
        aiSettings: activeAiSettings(),
      }),
    });
    state.chatMessages.push({
      role: "assistant",
      content: body.result?.content || "模型没有返回内容。",
      name: body.result?.modelProvider || "OfficeFlow AI",
    });
  } catch (error) {
    state.chatMessages.push({
      role: "assistant",
      content: `调用失败：${error.message}`,
      name: "OfficeFlow AI",
    });
  } finally {
    setBusy(dom.agentChatSendButton, false);
    renderChatMessages();
    syncActiveConversation();
  }
}

function downloadBase64File({ filename, mime, dataBase64 }) {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], { type: mime || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "OfficeFlow-AI-export";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

exportCurrentOutput = async function (format, button) {
  if (!state.lastOutput || !Object.keys(state.lastOutput).length) {
    setResult("暂无可导出内容", "请先运行一个办公场景。");
    return;
  }
  setBusy(button, true);
  setResult("正在导出文件", `正在生成 ${format.toUpperCase()} 文件。`);
  try {
    const body = await apiFetch("/api/export-file", {
      method: "POST",
      body: JSON.stringify({
        format,
        output: state.lastOutput,
      }),
    });
    downloadBase64File(body);
    setResult("文件已导出", body.filename || "导出完成。");
  } catch (error) {
    setResult("导出失败", error.message);
  } finally {
    setBusy(button, false);
  }
};

async function runBrowserActions(actions) {
  for (const action of actions) {
    if (action.type !== "notify") continue;

    if (dom.notificationToggle.checked) {
      await sendBrowserNotification("OfficeFlow AI", action.message);
    }

    if (dom.speechToggle.checked) {
      speak(action.message);
    }
  }
}

async function sendBrowserNotification(title, message) {
  if (!("Notification" in window)) return;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission === "granted") {
    new Notification(title, { body: message });
  }
}

function speak(message) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "zh-CN";
  utterance.rate = 0.96;
  window.speechSynthesis.speak(utterance);
}

function setBusy(button, isBusy) {
  button.disabled = isBusy;
  button.dataset.busy = isBusy ? "true" : "false";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadTemplates() {
  try {
    const body = await apiFetch("/api/templates");
    state.staticMode = false;
    state.templates = body.templates;
  } catch (error) {
    state.staticMode = true;
    state.templates = cloneData(FALLBACK_TEMPLATES);
    setResult("静态预览模式", STATIC_MODE_MESSAGE);
  }
  renderTemplates();
}

async function loadWorkflows() {
  if (state.staticMode) {
    state.workflows = readStaticWorkflows();
    renderWorkflows();
    return;
  }

  const body = await apiFetch("/api/workflows");
  state.workflows = body.workflows;
  renderWorkflows();
}

function handleScenarioInput(event) {
  markWorkflowDirty();
  if (event.target.id === "scenarioFileInput") {
    readMaterialFile(event.target.files?.[0]);
    return;
  }
  syncScenarioToAdvanced();
}

function readMaterialFile(file) {
  if (!file) return;
  const status = dom.scenarioFields.querySelector("#scenarioFileStatus");
  const input = dom.scenarioFields.querySelector("#scenarioInput");
  if (status) status.textContent = `正在读取：${file.name}`;

  const textExtensions = /\.(txt|md|csv|json|log)$/i;
  if (state.staticMode || textExtensions.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      if (input) input.value = String(reader.result || "");
      if (status) status.textContent = `已读取：${file.name}`;
      syncScenarioToAdvanced();
      markWorkflowDirty();
    };
    reader.onerror = () => {
      if (status) status.textContent = "文件读取失败，请手动粘贴内容。";
    };
    reader.readAsText(file, "utf-8");
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const dataUrl = String(reader.result || "");
      const dataBase64 = dataUrl.includes(",") ? dataUrl.split(",").pop() : dataUrl;
      const body = await apiFetch("/api/extract-file", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          dataBase64,
        }),
      });
      if (input) input.value = body.text || "";
      if (status) status.textContent = `已解析：${body.fileName || file.name}`;
    } catch (error) {
      if (status) status.textContent = `${error.message} 请改为粘贴文本。`;
    }
    syncScenarioToAdvanced();
    markWorkflowDirty();
  };
  reader.onerror = () => {
    if (status) status.textContent = "文件读取失败，请手动粘贴内容。";
  };
  reader.readAsDataURL(file);
}

function handleMaterialDrag(event) {
  const dropZone = event.target.closest?.("#scenarioDropZone");
  if (!dropZone) return;
  event.preventDefault();
  dropZone.classList.toggle("is-dragging", event.type === "dragover");
}

function handleMaterialDrop(event) {
  const dropZone = event.target.closest?.("#scenarioDropZone");
  if (!dropZone) return;
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
  readMaterialFile(event.dataTransfer?.files?.[0]);
}

function handleWorkflowEdit() {
  markWorkflowDirty();
  renderMeta();
}

function wireEvents() {
  ensureTutorialUi();
  document.querySelector("#helpTutorialButton")?.addEventListener("click", showTutorial);
  document.querySelector("#tutorialBackButton")?.addEventListener("click", hideTutorial);

  dom.templateList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-template-id]");
    if (!button) return;
    const template = state.templates.find((item) => item.id === button.dataset.templateId);
    if (!template) return;
    hideTutorial();
    applyTemplate(template);
    renderTemplates();
  });

  dom.workflowList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-workflow-id]");
    if (!button) return;
    const workflow = state.workflows.find((item) => item.id === button.dataset.workflowId);
    if (!workflow) return;
    hideTutorial();
    applyWorkflow(workflow);
    renderTemplates();
  });

  dom.aiProfileList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ai-profile-id]");
    if (!button) return;
    selectAiProfile(button.dataset.aiProfileId);
  });

  dom.openModelModalButton.addEventListener("click", openModelModal);
  dom.closeModelModalButton.addEventListener("click", closeModelModal);
  dom.closeModelModalSecondaryButton.addEventListener("click", closeModelModal);
  dom.modelModal.addEventListener("click", (event) => {
    if (event.target === dom.modelModal) closeModelModal();
  });

  dom.providerGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-provider]");
    if (!button) return;
    dom.aiProviderSelect.value = button.dataset.provider;
    applyProviderPreset(true);
    updateAiConfigStatus();
  });

  dom.agentModelSelect.addEventListener("change", (event) => {
    if (event.target.value) {
      selectAiProfile(event.target.value);
    }
  });

  dom.conversationList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-conversation-id]");
    if (deleteButton) {
      deleteConversation(deleteButton.dataset.deleteConversationId);
      return;
    }
    const button = event.target.closest("[data-conversation-id]");
    if (!button) return;
    selectConversation(button.dataset.conversationId);
  });

  dom.newConversationButton.addEventListener("click", (event) => {
    event.preventDefault();
    createConversation();
  });

  [
    dom.workflowName,
    dom.methodSelect,
    dom.urlInput,
    dom.queryInput,
    dom.headersInput,
    dom.bodyInput,
    dom.outputMapInput,
    dom.conditionLeft,
    dom.conditionOperator,
    dom.conditionRight,
    dom.messageInput,
  ].forEach((element) => {
    element.addEventListener("input", handleWorkflowEdit);
    element.addEventListener("change", handleWorkflowEdit);
  });

  dom.scenarioFields.addEventListener("input", handleScenarioInput);
  dom.scenarioFields.addEventListener("change", handleScenarioInput);
  dom.scenarioFields.addEventListener("dragover", handleMaterialDrag);
  dom.scenarioFields.addEventListener("dragleave", handleMaterialDrag);
  dom.scenarioFields.addEventListener("drop", handleMaterialDrop);

  [
    dom.aiProviderSelect,
    dom.aiProfileNameInput,
    dom.aiModelVersionSelect,
    dom.aiBaseUrlInput,
    dom.aiModelInput,
    dom.aiApiKeyInput,
  ].forEach((element) => {
    element.addEventListener("input", handleAiConfigChange);
    element.addEventListener("change", handleAiConfigChange);
  });

  dom.aiModelVersionSelect.addEventListener("change", () => {
    dom.aiModelInput.value = dom.aiModelVersionSelect.value;
    updateProfileName(true);
    handleAiConfigChange({ target: dom.aiModelVersionSelect });
  });

  dom.saveAiProfileButton.addEventListener("click", () => {
    saveAiProfile();
    closeModelModal();
  });
  dom.deleteAiProfileButton.addEventListener("click", deleteAiProfile);

  dom.favoriteWorkflowButton?.addEventListener("click", toggleFavoriteWorkflow);
  dom.runWorkflowButton.addEventListener("click", runWorkflow);
  dom.agentChatForm.addEventListener("submit", sendAgentChat);
  dom.agentChatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      dom.agentChatForm.requestSubmit();
    }
  });
  dom.inspectorToggleButton.addEventListener("click", toggleInspector);
  dom.inspectorCloseButton.addEventListener("click", closeInspector);
  dom.closeWorkbenchButton.addEventListener("click", closeWorkbench);
  dom.surfaceScrim.addEventListener("click", closeFloatingSurfaces);
  dom.clearOutputButton.addEventListener("click", () => renderOutput({}));

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-export-format]");
    if (!button) return;
    exportCurrentOutput(button.dataset.exportFormat, button);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFloatingSurfaces();
    }
  });
}

function renderChatMessages() {
  if (!state.chatMessages.length) {
    dom.agentChatMessages.innerHTML = "";
    return;
  }

  dom.agentChatMessages.innerHTML = state.chatMessages
    .map(
      (message) => `
        <article class="agent-message ${message.role === "user" ? "user" : "assistant"}">
          <span>${escapeHtml(message.name || (message.role === "user" ? "你" : "OfficeFlow AI"))}</span>
          <p>${escapeHtml(message.content || "")}</p>
        </article>
      `,
    )
    .join("");
}

function getConversationTitle(conversation) {
  const firstUser = conversation.messages.find((message) => message.role === "user");
  return summarizeTextForTitle(firstUser?.content || conversation.title) || "新对话";
}

function renderConversations() {
  if (!state.conversations.length) {
    dom.conversationList.innerHTML = '<p class="muted compact-empty">还没有对话记录。</p>';
    return;
  }

  dom.conversationList.innerHTML = state.conversations
    .map(
      (conversation) => `
        <div class="compact-item conversation-item ${conversation.id === state.activeConversationId ? "is-active" : ""}" data-conversation-id="${conversation.id}">
          <button class="conversation-main" type="button" data-conversation-id="${conversation.id}">
            <strong>${escapeHtml(getConversationTitle(conversation))}</strong>
            <span>${escapeHtml(new Date(conversation.updatedAt).toLocaleString())}</span>
          </button>
          <button class="conversation-delete" type="button" data-delete-conversation-id="${conversation.id}" aria-label="删除对话">删除</button>
        </div>
      `,
    )
    .join("");
}

function syncActiveConversation() {
  const conversation = currentConversation();
  if (!conversation) return;
  conversation.messages = state.chatMessages;
  conversation.updatedAt = new Date().toISOString();
  if (conversation.title === "新对话") {
    conversation.title = summarizeTextForTitle(state.chatMessages.find((message) => message.role === "user")?.content) || "新对话";
  }
  saveConversations();
}

function createConversation() {
  const conversation = {
    id: createId("chat"),
    title: "新对话",
    messages: [],
    updatedAt: new Date().toISOString(),
  };
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.chatMessages = [];
  renderChatMessages();
  saveConversations();
}

function ensureConversation() {
  if (!state.activeConversationId || !currentConversation()) {
    createConversation();
  }
}

function appendWorkflowRunToConversations({ prompt, output }) {
  const title = summarizeTextForTitle(prompt) || output?.title || "办公处理结果";
  const summary = output?.summary ? `\n\n摘要：${output.summary}` : "";
  const todos = Array.isArray(output?.todos)
    ? `\n\n待办：\n${output.todos
        .map((todo) => `- ${todo.owner || "负责人"}：${todo.item || ""}${todo.due ? `（${todo.due}）` : ""}`)
        .join("\n")}`
    : "";
  const conversation = {
    id: createId("chat"),
    title,
    updatedAt: new Date().toISOString(),
    messages: [
      { role: "user", content: prompt || title, name: "你" },
      {
        role: "assistant",
        content: `${output?.title || "办公处理结果"}${summary}${todos}`,
        name: output?.modelProvider || "OfficeFlow AI",
      },
    ],
  };
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.chatMessages = conversation.messages;
  renderChatMessages();
  saveConversations();
}

function deleteConversation(conversationId) {
  const index = state.conversations.findIndex((item) => item.id === conversationId);
  if (index === -1) return;
  state.conversations.splice(index, 1);

  if (state.activeConversationId === conversationId) {
    state.activeConversationId = null;
    state.chatMessages = [];
    renderChatMessages();
  }

  saveConversations();
}

function loadConversations() {
  state.conversations = readJsonStorage(CONVERSATION_STORAGE_KEY, []);
  state.activeConversationId = null;
  state.chatMessages = [];
  localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
  renderChatMessages();
  renderConversations();
}

function exportFormatsForTask(taskType = "") {
  const normalized = String(taskType || "").toLowerCase();
  if (normalized === "data") return ["xlsx", "pdf"];
  if (normalized === "contract") return ["docx", "xlsx"];
  return ["docx", "pdf"];
}

function renderExportActions(output) {
  if (!output || !Object.keys(output).length) return "";
  const formats = exportFormatsForTask(output.taskType);
  const labels = {
    docx: "导出 Word",
    pdf: "导出 PDF",
    xlsx: "导出 Excel",
  };
  return `
    <div class="export-actions" aria-label="导出文件">
      ${formats
        .map((format) => `<button type="button" data-export-format="${format}">${labels[format] || `导出 ${format.toUpperCase()}`}</button>`)
        .join("")}
    </div>
  `;
}

function renderOfficeResult(output) {
  const keyPoints = Array.isArray(output.keyPoints) ? output.keyPoints : [];
  const todos = Array.isArray(output.todos) ? output.todos : [];
  const extraSections = [
    renderOptionalResultSection("润色稿", output.polishedDraft),
    renderOptionalResultSection("风险提示", output.riskItems),
  ].join("");

  return `
    <article class="office-result-card">
      <div class="office-result-head">
        <div>
          <span class="section-label">${escapeHtml(output.taskType || "AI 结果")}</span>
          <h3>${escapeHtml(output.title || "办公处理结果")}</h3>
        </div>
        <div class="result-head-actions">
          <span class="result-status">${output.ready ? "可复核" : "待处理"}</span>
          ${renderExportActions(output)}
        </div>
      </div>

      <section class="result-section result-summary">
        <h4>摘要</h4>
        <p>${escapeHtml(output.summary || "暂无摘要。")}</p>
      </section>

      <div class="result-columns">
        <section class="result-section">
          <h4>关键要点</h4>
          <ul>${renderListItems(keyPoints)}</ul>
        </section>
        <section class="result-section">
          <h4>待办事项</h4>
          <ul class="todo-result-list">${renderTodoItems(todos)}</ul>
        </section>
      </div>

      ${extraSections}

      <section class="result-section recommendation">
        <h4>建议</h4>
        <p>${escapeHtml(output.recommendation || "建议人工复核后再发送或归档。")}</p>
      </section>
    </article>
  `;
}

function printableResultHtml(output) {
  const keyPoints = Array.isArray(output.keyPoints) ? output.keyPoints : [];
  const todos = Array.isArray(output.todos) ? output.todos : [];
  const risks = Array.isArray(output.riskItems) ? output.riskItems : [];
  const list = (items) => items.map((item) => `<li>${escapeHtml(typeof item === "object" ? item.item || JSON.stringify(item) : item)}</li>`).join("");
  const todoTable = todos.length
    ? `<table><thead><tr><th>负责人</th><th>事项</th><th>截止时间</th></tr></thead><tbody>${todos
        .map((todo) => `<tr><td>${escapeHtml(todo.owner || "")}</td><td>${escapeHtml(todo.item || todo || "")}</td><td>${escapeHtml(todo.due || "")}</td></tr>`)
        .join("")}</tbody></table>`
    : "<p>暂无待办事项。</p>";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(output.title || "OfficeFlow AI 办公结果")}</title>
  <style>
    body { font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif; color: #172033; margin: 42px; line-height: 1.75; }
    h1 { font-size: 26px; margin: 0 0 8px; }
    h2 { font-size: 17px; margin: 26px 0 10px; border-bottom: 1px solid #d8e0ee; padding-bottom: 6px; }
    .meta { color: #5f6f86; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #d8e0ee; padding: 9px 11px; text-align: left; vertical-align: top; }
    th { background: #f3f6fb; }
    ul { padding-left: 22px; }
    @media print { body { margin: 28px; } button { display: none; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(output.title || "办公处理结果")}</h1>
  <div class="meta">场景：${escapeHtml(output.taskType || "office")}　面向对象：${escapeHtml(output.audience || "未填写")}　部门：${escapeHtml(output.department || "未填写")}</div>
  <h2>摘要</h2><p>${escapeHtml(output.summary || "暂无摘要。")}</p>
  <h2>关键要点</h2><ul>${list(keyPoints) || "<li>暂无关键要点。</li>"}</ul>
  <h2>待办事项</h2>${todoTable}
  ${output.polishedDraft ? `<h2>润色稿</h2><p>${escapeHtml(output.polishedDraft)}</p>` : ""}
  ${risks.length ? `<h2>风险提示</h2><ul>${list(risks)}</ul>` : ""}
  <h2>建议</h2><p>${escapeHtml(output.recommendation || "建议人工复核后再发送或归档。")}</p>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 200));</script>
</body>
</html>`;
}

function exportPdfByPrint(output) {
  const printWindow = window.open("", "_blank", "width=920,height=720");
  if (!printWindow) {
    throw new Error("浏览器拦截了 PDF 打印窗口，请允许弹窗后重试。");
  }
  printWindow.document.open();
  printWindow.document.write(printableResultHtml(output));
  printWindow.document.close();
}

async function exportCurrentOutput(format, button) {
  if (!state.lastOutput || !Object.keys(state.lastOutput).length) {
    setResult("暂无可导出内容", "请先运行一个办公场景。");
    return;
  }

  const originalText = button.textContent;
  setBusy(button, true);
  button.textContent = format === "pdf" ? "打开打印..." : "生成中...";

  try {
    if (format === "pdf") {
      exportPdfByPrint(state.lastOutput);
      button.textContent = originalText;
      return;
    }

    const body = await apiFetch("/api/export-file", {
      method: "POST",
      body: JSON.stringify({
        format,
        output: state.lastOutput,
      }),
    });
    downloadBase64File(body);
    button.textContent = "已导出";
    setTimeout(() => {
      button.textContent = originalText;
    }, 1200);
  } catch (error) {
    button.textContent = originalText;
    setResult("导出失败", error.message);
  } finally {
    setBusy(button, false);
  }
}

sendAgentChat = async function (event) {
  event.preventDefault();
  const prompt = dom.agentChatInput.value.trim();
  if (!prompt) return;

  ensureConversation();
  state.chatMessages.push({ role: "user", content: prompt, name: "你" });
  const conversation = currentConversation();
  if (conversation && conversation.title === "新对话") {
    conversation.title = summarizeTextForTitle(prompt);
  }
  dom.agentChatInput.value = "";
  renderChatMessages();
  syncActiveConversation();

  if (state.staticMode) {
    state.chatMessages.push({
      role: "assistant",
      content: "当前是 index.html 静态预览模式。AI 对话和运行流程需要先执行 npm start，再通过 http://127.0.0.1:5173/ 打开。",
      name: "OfficeFlow AI",
    });
    renderChatMessages();
    syncActiveConversation();
    return;
  }

  setBusy(dom.agentChatSendButton, true);
  try {
    const body = await apiFetch("/api/ai-chat", {
      method: "POST",
      body: JSON.stringify({
        messages: state.chatMessages.map(({ role, content }) => ({ role, content })),
        aiSettings: activeAiSettings(),
      }),
    });
    state.chatMessages.push({
      role: "assistant",
      content: body.result?.content || "模型没有返回内容。",
      name: body.result?.modelProvider || "OfficeFlow AI",
    });
  } catch (error) {
    state.chatMessages.push({
      role: "assistant",
      content: `调用失败：${error.message}`,
      name: "OfficeFlow AI",
    });
  } finally {
    setBusy(dom.agentChatSendButton, false);
    renderChatMessages();
    syncActiveConversation();
  }
};

readMaterialFile = function (file) {
  if (!file) return;
  const status = dom.scenarioFields.querySelector("#scenarioFileStatus");
  const input = dom.scenarioFields.querySelector("#scenarioInput");
  if (status) status.textContent = `正在读取：${file.name}`;

  const textExtensions = /\.(txt|md|csv|json|log)$/i;
  if (state.staticMode || textExtensions.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      if (input) input.value = String(reader.result || "");
      if (status) status.textContent = `已读取：${file.name}`;
      syncScenarioToAdvanced();
      markWorkflowDirty();
    };
    reader.onerror = () => {
      if (status) status.textContent = "文件读取失败，请手动粘贴内容。";
    };
    reader.readAsText(file, "utf-8");
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const dataUrl = String(reader.result || "");
      const dataBase64 = dataUrl.includes(",") ? dataUrl.split(",").pop() : dataUrl;
      const body = await apiFetch("/api/extract-file", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          dataBase64,
        }),
      });
      if (input) input.value = body.text || "";
      if (status) status.textContent = `已解析：${body.fileName || file.name}`;
    } catch (error) {
      if (status) status.textContent = `${error.message} 请改为手动粘贴文本。`;
    }
    syncScenarioToAdvanced();
    markWorkflowDirty();
  };
  reader.onerror = () => {
    if (status) status.textContent = "文件读取失败，请手动粘贴内容。";
  };
  reader.readAsDataURL(file);
};

// Final runtime overrides kept near init so older generated blocks cannot take precedence.
function ensureTutorialUi() {
  if (!document.querySelector("#helpTutorialButton")) {
    const topbar = document.querySelector(".topbar");
    const button = document.createElement("button");
    button.id = "helpTutorialButton";
    button.className = "help-button";
    button.type = "button";
    button.setAttribute("aria-label", "打开使用教程");
    button.textContent = "?";
    topbar?.appendChild(button);
  }
  if (!document.querySelector("#tutorialPanel")) {
    const panel = document.createElement("section");
    panel.id = "tutorialPanel";
    panel.className = "tutorial-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "使用教程");
    panel.innerHTML = `
      <div class="tutorial-head">
        <div>
          <p class="section-label">使用教程</p>
          <h2>5 分钟演示 OfficeFlow AI</h2>
          <p>从模型配置、场景选择、材料填写，到复核清单和文件导出，完整展示单用户自动办公闭环。</p>
        </div>
        <button id="tutorialBackButton" class="secondary-button" type="button">返回工作台</button>
      </div>
      <div class="tutorial-grid">
        <article><span>1</span><strong>配置 AI 模型</strong><p>在左侧「AI 模型」中添加 GPT、Claude、Gemini、DeepSeek、Kimi 或 Qwen 的 API Key。未配置时也能使用本地演示逻辑。</p></article>
        <article><span>2</span><strong>选择办公场景</strong><p>从办公场景库选择会议纪要、公文润色、合同摘要、数据统计、信息检索或格式修正。</p></article>
        <article><span>3</span><strong>填写或上传材料</strong><p>在右侧材料区粘贴文本，也可以上传 Word、PDF、Excel、CSV 等文件，系统会把内容提取到输入框。</p></article>
        <article><span>4</span><strong>生成办公结果</strong><p>点击蓝色生成按钮，系统会按固定业务结构输出摘要、要点、待办、风险和建议。</p></article>
        <article><span>5</span><strong>查看复核清单</strong><p>每次结果都会给出人工复核项，帮助确认时间、金额、责任人、数据口径和 AI 推断内容。</p></article>
        <article><span>6</span><strong>导出正式文件</strong><p>根据场景导出 Word、Excel 或 PDF，文件会套用统一公司格式，便于归档、发送或继续编辑。</p></article>
      </div>
    `;
    document.querySelector(".topbar")?.after(panel);
  }
}

function showTutorial() {
  ensureTutorialUi();
  document.querySelector("#tutorialPanel").hidden = false;
  [dom.agentChatPanel, dom.workbenchShell, dom.mainResultPanel].forEach((element) => {
    if (element) element.hidden = true;
  });
  document.querySelector("#tutorialPanel")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function hideTutorial() {
  document.querySelector("#tutorialPanel")?.setAttribute("hidden", "");
  [dom.agentChatPanel, dom.workbenchShell, dom.mainResultPanel].forEach((element) => {
    if (element) element.hidden = false;
  });
}

function sceneResultLabels(taskType) {
  return RESULT_LABELS_BY_TASK[String(taskType || "").toLowerCase()] || RESULT_LABELS_BY_TASK.meeting;
}

function renderReviewChecklist(items = []) {
  if (!Array.isArray(items) || !items.length) return "";
  return `
    <section class="result-section review-checklist">
      <h4>复核清单</h4>
      <ul>${renderListItems(items)}</ul>
    </section>
  `;
}

renderChatMessages = function () {
  if (!state.chatMessages.length) {
    dom.agentChatMessages.innerHTML = "";
    return;
  }
  dom.agentChatMessages.innerHTML = state.chatMessages
    .map(
      (message) => `
        <article class="agent-message ${message.role === "user" ? "user" : "assistant"}">
          <span>${escapeHtml(message.name || (message.role === "user" ? "\u4f60" : "OfficeFlow AI"))}</span>
          <p>${escapeHtml(message.content || "")}</p>
        </article>
      `,
    )
    .join("");
  requestAnimationFrame(() => {
    dom.agentChatForm?.scrollIntoView({ block: "end", behavior: "smooth" });
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  });
};

getConversationTitle = function (conversation) {
  const firstUser = conversation.messages.find((message) => message.role === "user");
  return summarizeTextForTitle(firstUser?.content || conversation.title) || "\u65b0\u5bf9\u8bdd";
};

renderConversations = function () {
  if (!state.conversations.length) {
    dom.conversationList.innerHTML = '<p class="muted compact-empty">\u8fd8\u6ca1\u6709\u5bf9\u8bdd\u8bb0\u5f55\u3002</p>';
    return;
  }
  dom.conversationList.innerHTML = state.conversations
    .map(
      (conversation) => `
        <div class="compact-item conversation-item ${conversation.id === state.activeConversationId ? "is-active" : ""}" data-conversation-id="${conversation.id}">
          <button class="conversation-main" type="button" data-conversation-id="${conversation.id}">
            <strong>${escapeHtml(getConversationTitle(conversation))}</strong>
            <span>${escapeHtml(new Date(conversation.updatedAt).toLocaleString())}</span>
          </button>
          <button class="conversation-delete" type="button" data-delete-conversation-id="${conversation.id}" aria-label="\u5220\u9664\u5bf9\u8bdd">\u5220\u9664</button>
        </div>
      `,
    )
    .join("");
};

loadConversations = function () {
  state.conversations = readJsonStorage(CONVERSATION_STORAGE_KEY, []);
  state.activeConversationId = null;
  state.chatMessages = [];
  localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
  renderChatMessages();
  renderConversations();
};

exportFormatsForTask = function (taskType = "") {
  const normalized = String(taskType || "").toLowerCase();
  if (normalized === "data") return ["xlsx", "pdf"];
  if (normalized === "contract") return ["docx", "xlsx"];
  return ["docx", "pdf"];
};

renderExportActions = function (output) {
  if (!output || !Object.keys(output).length) return "";
  const labels = { docx: "\u5bfc\u51fa Word", pdf: "\u5bfc\u51fa PDF", xlsx: "\u5bfc\u51fa Excel" };
  return `
    <div class="export-actions" aria-label="\u5bfc\u51fa\u6587\u4ef6">
      ${exportFormatsForTask(output.taskType)
        .map((format) => `<button type="button" data-export-format="${format}">${labels[format] || `\u5bfc\u51fa ${format.toUpperCase()}`}</button>`)
        .join("")}
    </div>
  `;
};

exportCurrentOutput = async function (format, button) {
  if (!state.lastOutput || !Object.keys(state.lastOutput).length) {
    setResult("\u6682\u65e0\u53ef\u5bfc\u51fa\u5185\u5bb9", "\u8bf7\u5148\u8fd0\u884c\u4e00\u4e2a\u529e\u516c\u573a\u666f\u3002");
    return;
  }
  const originalText = button.textContent;
  setBusy(button, true);
  button.textContent = format === "pdf" ? "\u6253\u5f00\u6253\u5370..." : "\u751f\u6210\u4e2d...";
  try {
    if (format === "pdf") {
      exportPdfByPrint(state.lastOutput);
      button.textContent = originalText;
      return;
    }
    const body = await apiFetch("/api/export-file", {
      method: "POST",
      body: JSON.stringify({ format, output: state.lastOutput }),
    });
    downloadBase64File(body);
    button.textContent = "\u5df2\u5bfc\u51fa";
    setTimeout(() => {
      button.textContent = originalText;
    }, 1200);
  } catch (error) {
    button.textContent = originalText;
    setResult("\u5bfc\u51fa\u5931\u8d25", error.message);
  } finally {
    setBusy(button, false);
  }
};

readMaterialFile = function (file) {
  if (!file) return;
  const status = dom.scenarioFields.querySelector("#scenarioFileStatus");
  const input = dom.scenarioFields.querySelector("#scenarioInput");
  if (status) status.textContent = `\u6b63\u5728\u8bfb\u53d6\uff1a${file.name}`;
  const textExtensions = /\.(txt|md|csv|json|log)$/i;
  if (state.staticMode || textExtensions.test(file.name)) {
    readLocalTextPreview(file)
      .then((result) => {
        if (input) input.value = result.text;
        if (status) status.textContent = result.note || `\u5df2\u8bfb\u53d6\uff1a${file.name}`;
        syncScenarioToAdvanced();
        markWorkflowDirty();
      })
      .catch(() => {
        if (status) status.textContent = "\u6587\u4ef6\u8bfb\u53d6\u5931\u8d25\uff0c\u8bf7\u624b\u52a8\u7c98\u8d34\u5185\u5bb9\u3002";
      });
    return;
  }
  extractFileViaApi(file)
    .then((body) => {
      if (input) input.value = body.text || "";
      if (status) status.textContent = body.note || `\u5df2\u89e3\u6790\uff1a${body.fileName || file.name}`;
    })
    .catch((error) => {
      if (status) status.textContent = `${error.message} \u8bf7\u6539\u4e3a\u624b\u52a8\u7c98\u8d34\u6587\u672c\u3002`;
    })
    .finally(() => {
      syncScenarioToAdvanced();
      markWorkflowDirty();
    });
};

appendWorkflowRunToConversations = function ({ prompt, output }) {
  const title = summarizeTextForTitle(prompt) || output?.title || "\u529e\u516c\u5904\u7406\u7ed3\u679c";
  const summary = output?.summary ? `\n\n\u6458\u8981\uff1a${output.summary}` : "";
  const links = Array.isArray(output?.sourceLinks) && output.sourceLinks.length
    ? `\n\n\u8054\u7f51\u68c0\u7d22\u641c\u7d22\uff1a\n${output.sourceLinks.map((link) => `- ${link.title || "\u68c0\u7d22\u6458\u8981"}\uff1a${link.summary || "\u6682\u65e0\u6458\u8981\uff0c\u5efa\u8bae\u7ed3\u5408\u539f\u59cb\u6750\u6599\u590d\u6838\u3002"}`).join("\n")}`
    : "";
  const review = Array.isArray(output?.reviewChecklist) && output.reviewChecklist.length
    ? `\n\n复核清单：\n${output.reviewChecklist.map((item) => `- ${item}`).join("\n")}`
    : "";
  const conversation = {
    id: createId("chat"),
    title,
    favorite: false,
    officeResult: output || {},
    updatedAt: new Date().toISOString(),
    messages: [
      { role: "user", content: prompt || title, name: "\u4f60" },
      {
        role: "assistant",
        content: `${output?.title || "\u529e\u516c\u5904\u7406\u7ed3\u679c"}${summary}${links}${review}`,
        name: output?.modelProvider || "OfficeFlow AI",
      },
    ],
  };
  state.conversations.unshift(conversation);
  state.lastResultConversationId = conversation.id;
  writeJsonStorage(CONVERSATION_STORAGE_KEY, state.conversations);
  renderConversations();
  renderDashboard();
  return conversation.id;
};

function renderSourceLinks(links = []) {
  if (!Array.isArray(links) || !links.length) return "";
  return `
    <section class="result-section source-links">
      <h4>\u8054\u7f51\u68c0\u7d22\u641c\u7d22</h4>
      <div class="source-link-list">
        ${links
          .map(
            (link) => `
              <article>
                <strong>${escapeHtml(link.title || "\u68c0\u7d22\u6458\u8981")}</strong>
                <span>${escapeHtml(link.source || "\u7f51\u7edc\u6765\u6e90")}</span>
                <p>${escapeHtml(link.summary || "\u6682\u65e0\u6458\u8981\uff0c\u5efa\u8bae\u7ed3\u5408\u539f\u59cb\u6750\u6599\u590d\u6838\u3002")}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderSkillsUsed(skills = []) {
  if (!Array.isArray(skills) || !skills.length) return "";
  return `
    <section class="result-section skills-used">
      <h4>Agent Skill</h4>
      <div class="skill-chip-list">
        ${skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}
      </div>
    </section>
  `;
}

renderOfficeResult = function (output) {
  const keyPoints = Array.isArray(output.keyPoints) ? output.keyPoints : [];
  const todos = Array.isArray(output.todos) ? output.todos : [];
  const labels = sceneResultLabels(output.taskType);
  const extraSections = [
    renderOptionalResultSection("\u4fee\u6b63\u540e\u6b63\u6587", output.formattedDraft),
    renderOptionalResultSection("\u516c\u53f8\u56fa\u5b9a\u683c\u5f0f", output.companyFormatRules),
    renderOptionalResultSection("\u683c\u5f0f\u4e0d\u7b26\u9879", output.formatIssues),
    renderOptionalResultSection("\u9519\u522b\u5b57/\u8868\u8fbe\u98ce\u9669", output.typoIssues),
    renderOptionalResultSection("\u6da6\u8272\u7a3f", output.polishedDraft),
    renderOptionalResultSection("\u98ce\u9669\u63d0\u793a", output.riskItems),
    renderSkillsUsed(output.skillsUsed),
    renderSourceLinks(output.sourceLinks),
    renderReviewChecklist(output.reviewChecklist),
  ].join("");

  return `
    <article class="office-result-card">
      <div class="office-result-head">
        <div>
          <span class="section-label">${escapeHtml(output.taskType || "AI \u7ed3\u679c")}</span>
          <h3>${escapeHtml(output.title || "\u529e\u516c\u5904\u7406\u7ed3\u679c")}</h3>
        </div>
        <div class="result-head-actions">
          ${renderResultFavoriteButton()}
          <span class="result-status">${output.ready ? "\u53ef\u590d\u6838" : "\u5f85\u5904\u7406"}</span>
          ${renderExportActions(output)}
        </div>
      </div>
      <section class="result-section result-summary">
        <h4>\u6458\u8981</h4>
        <p>${escapeHtml(output.summary || "\u6682\u65e0\u6458\u8981\u3002")}</p>
      </section>
      <div class="result-columns">
        <section class="result-section">
          <h4>${escapeHtml(labels.points)}</h4>
          <ul>${renderListItems(keyPoints)}</ul>
        </section>
        <section class="result-section">
          <h4>${escapeHtml(labels.todos)}</h4>
          <ul class="todo-result-list">${renderTodoItems(todos)}</ul>
        </section>
      </div>
      ${extraSections}
      <section class="result-section recommendation">
        <h4>\u5efa\u8bae</h4>
        <p>${escapeHtml(output.recommendation || "\u5efa\u8bae\u4eba\u5de5\u590d\u6838\u540e\u518d\u53d1\u9001\u6216\u5f52\u6863\u3002")}</p>
      </section>
    </article>
  `;
};

function removeLegacyTutorialAndDecor() {
  document.querySelector("#helpTutorialButton")?.remove();
  document.querySelector("#tutorialPanel")?.remove();
  document.querySelector(".ambient-signs")?.remove();
  const savedPanel = dom.workflowList?.closest("details");
  if (savedPanel) savedPanel.hidden = true;
}

ensureTutorialUi = function () {
  removeLegacyTutorialAndDecor();
};

showTutorial = function () {
  removeLegacyTutorialAndDecor();
};

hideTutorial = function () {
  removeLegacyTutorialAndDecor();
  [dom.agentChatPanel, dom.workbenchShell, dom.mainResultPanel].forEach((element) => {
    if (element) element.hidden = false;
  });
};

setAiForm = function (settings = {}) {
  const provider = AI_PROVIDER_PRESETS[settings.provider] ? settings.provider : "openai";
  dom.aiProviderSelect.value = provider;
  applyProviderPreset(false);
  dom.aiBaseUrlInput.value = settings.baseUrl || dom.aiBaseUrlInput.value;
  dom.aiModelInput.value = settings.model || dom.aiModelInput.value;
  syncModelVersionSelect(dom.aiModelInput.value);
  dom.aiProfileNameInput.value = settings.name || defaultProfileName();
  dom.aiApiKeyInput.value = "";
  dom.aiApiKeyInput.placeholder = settings.apiKey ? "已保存 API Key；留空不会覆盖" : "请输入 API Key";
  dom.aiContextInput.value = settings.contextInput || "";
  dom.aiContextOutput.value = settings.contextOutput || "";
  dom.aiToolRounds.value = settings.toolRounds || "";
  updateAiConfigStatus();
};

updateAiConfigStatus = function () {
  const selected = state.aiProfiles.find((profile) => profile.id === state.activeAiProfileId);
  const settings = selected || aiSettingsFromForm();
  const isConfigured = Boolean(settings.baseUrl && settings.model && settings.apiKey);
  dom.aiConfigStatus.textContent = isConfigured ? "已配置" : "未配置";
  dom.aiConfigStatus.classList.toggle("is-ready", isConfigured);
};

openModelModal = function () {
  state.activeAiProfileId = null;
  setAiForm({ provider: dom.aiProviderSelect.value || "openai" });
  renderProviderGrid();
  updateProviderConfigTitle();
  dom.modelModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("model-modal-open");
};

saveAiProfile = function () {
  const previous = state.aiProfiles.find((item) => item.id === state.activeAiProfileId);
  const settings = aiSettingsFromForm();
  const id = state.activeAiProfileId || createId("model");
  const profile = {
    ...settings,
    id,
    apiKey: settings.apiKey || previous?.apiKey || "",
    name: settings.name || `${settings.provider} / ${settings.model || "未命名"}`,
  };
  const index = state.aiProfiles.findIndex((item) => item.id === id);
  if (index >= 0) state.aiProfiles[index] = profile;
  else state.aiProfiles.push(profile);
  state.activeAiProfileId = id;
  setAiForm(profile);
  writeAiSettings(profile);
  saveAiProfiles();
};

function isConversationFavorited(conversation) {
  return Boolean(conversation?.favorite);
}

function toggleConversationFavorite(conversationId = state.activeConversationId) {
  const conversation = state.conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  conversation.favorite = !conversation.favorite;
  conversation.updatedAt = new Date().toISOString();
  writeJsonStorage(CONVERSATION_STORAGE_KEY, state.conversations);
  renderConversations();
  renderDashboard();
}

function resultConversation() {
  const resultId = state.lastResultConversationId;
  if (resultId) {
    const conversation = state.conversations.find((item) => item.id === resultId);
    if (conversation) return conversation;
  }
  return currentConversation();
}

function renderResultFavoriteButton() {
  const conversation = resultConversation();
  const favorited = isConversationFavorited(conversation);
  return `
    <button
      class="result-favorite-button ${favorited ? "is-favorited" : ""}"
      type="button"
      data-result-favorite
      aria-pressed="${String(favorited)}"
      aria-label="${favorited ? "取消收藏此结果" : "收藏此结果"}"
      title="${favorited ? "取消收藏此结果" : "收藏此结果"}"
    >★</button>
  `;
}

function toggleResultFavorite() {
  const conversation = resultConversation();
  if (!conversation) return;
  toggleConversationFavorite(conversation.id);
  updateConversationFavoriteButton();
}

renderConversations = function () {
  if (!state.conversations.length) {
    dom.conversationList.innerHTML = '<p class="muted compact-empty">还没有对话记录。</p>';
    return;
  }
  const sorted = [...state.conversations].sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)));
  dom.conversationList.innerHTML = sorted
    .map(
      (conversation) => `
        <div class="compact-item conversation-item ${conversation.id === state.activeConversationId ? "is-active" : ""}" data-conversation-id="${conversation.id}">
          <button class="conversation-favorite ${isConversationFavorited(conversation) ? "is-favorited" : ""}" type="button" data-favorite-conversation-id="${conversation.id}" aria-label="${isConversationFavorited(conversation) ? "取消收藏" : "收藏对话"}">★</button>
          <button class="conversation-main" type="button" data-conversation-id="${conversation.id}">
            <strong>${escapeHtml(getConversationTitle(conversation))}</strong>
            <span>${escapeHtml(new Date(conversation.updatedAt).toLocaleString())}</span>
          </button>
          <button class="conversation-delete" type="button" data-delete-conversation-id="${conversation.id}" aria-label="删除对话">删除</button>
        </div>
      `,
    )
    .join("");
};

function updateConversationFavoriteButton() {
  const conversation = currentConversation();
  if (!dom.favoriteWorkflowButton) return;
  const favorited = isConversationFavorited(conversation);
  dom.favoriteWorkflowButton.classList.toggle("is-favorited", favorited);
  dom.favoriteWorkflowButton.setAttribute("aria-pressed", String(favorited));
  dom.favoriteWorkflowButton.setAttribute("aria-label", favorited ? "取消收藏当前对话" : "收藏当前对话");
  dom.favoriteWorkflowButton.title = favorited ? "取消收藏当前对话" : "收藏当前对话";
}

syncActiveConversation = function () {
  const conversation = currentConversation();
  if (!conversation) return;
  conversation.messages = state.chatMessages;
  conversation.updatedAt = new Date().toISOString();
  saveConversations();
  updateConversationFavoriteButton();
};

selectConversation = function (conversationId) {
  const conversation = state.conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  state.activeConversationId = conversation.id;
  state.chatMessages = conversation.messages || [];
  renderChatMessages();
  saveConversations();
  updateConversationFavoriteButton();
};

deleteConversation = function (conversationId) {
  const index = state.conversations.findIndex((item) => item.id === conversationId);
  if (index === -1) return;
  state.conversations.splice(index, 1);
  if (state.activeConversationId === conversationId) {
    state.activeConversationId = state.conversations[Math.max(0, index - 1)]?.id || state.conversations[0]?.id || null;
    state.chatMessages = state.conversations.find((item) => item.id === state.activeConversationId)?.messages || [];
  }
  if (state.lastResultConversationId === conversationId) {
    state.lastResultConversationId = null;
  }
  if (!state.activeConversationId) {
    state.chatMessages = [];
    renderChatMessages();
    saveConversations();
    updateConversationFavoriteButton();
    return;
  }
  renderChatMessages();
  saveConversations();
  updateConversationFavoriteButton();
};

loadConversations = function () {
  state.conversations = readJsonStorage(CONVERSATION_STORAGE_KEY, []);
  state.activeConversationId = null;
  state.chatMessages = [];
  localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
  renderChatMessages();
  renderConversations();
  updateConversationFavoriteButton();
};

createConversation = function () {
  const conversation = {
    id: createId("chat"),
    title: "新对话",
    messages: [],
    favorite: false,
    updatedAt: new Date().toISOString(),
  };
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.chatMessages = [];
  renderChatMessages();
  saveConversations();
  updateConversationFavoriteButton();
};

toggleFavoriteWorkflow = async function () {
  if (!state.activeConversationId) createConversation();
  toggleConversationFavorite(state.activeConversationId);
  updateConversationFavoriteButton();
};

function ensureAgentControls() {
  if (document.querySelector("#agentAttachButton")) return;
  const actions = dom.agentChatForm.querySelector(".agent-chat-actions");
  const button = document.createElement("button");
  button.id = "agentAttachButton";
  button.className = "agent-attach-button";
  button.type = "button";
  button.title = "上传文件";
  button.textContent = "+";
  const menu = document.createElement("div");
  menu.id = "agentAttachMenu";
  menu.className = "agent-attach-menu";
  menu.hidden = true;
  menu.innerHTML = `
    <button type="button" data-agent-action="upload">上传文件</button>
    <div class="agent-plugin-list" aria-label="办公插件">
      <strong>办公插件</strong>
      ${OFFICE_AGENT_SKILLS.map(
        (skill) => `<button type="button" data-agent-skill="${skill.id}">${skill.name}</button>`,
      ).join("")}
    </div>
  `;
  const file = document.createElement("input");
  file.id = "agentFileInput";
  file.type = "file";
  file.accept = ".txt,.md,.csv,.json,.log,.docx,.pdf,.xlsx,.xlsm,.xltx";
  file.hidden = true;
  actions.prepend(button, menu, file);
}

function inferAgentTaskType(text = "") {
  if (/合同|条款|甲方|乙方|付款|违约/.test(text)) return "contract";
  if (/数据|表格|统计|指标|Excel|excel|xlsx|报表/.test(text)) return "data";
  if (/检索|搜索|联网|资料|链接|行业/.test(text)) return "research";
  if (/格式|错别字|修正|校对/.test(text)) return "format";
  if (/公文|通知|润色|发布/.test(text)) return "official";
  return "meeting";
}

function inferExportFormat(text = "") {
  if (/excel|xlsx|表格/i.test(text)) return "xlsx";
  if (/pdf/i.test(text)) return "pdf";
  if (/word|docx|文档/i.test(text)) return "docx";
  return "";
}

const OFFICE_AGENT_SKILLS = [
  {
    id: "documents",
    name: "Documents 文档处理",
    keywords: /文档|word|docx|公文|通知|纪要|润色|格式|错别字|校对|报告|正文/i,
    instruction: "整理、改写、校对和排版正式办公文档，输出结构清晰、可复核、适合导出 Word/PDF 的正文。",
  },
  {
    id: "spreadsheets",
    name: "Spreadsheets 表格分析",
    keywords: /表格|excel|xlsx|csv|数据|统计|指标|报表|金额|清单|汇总/i,
    instruction: "把业务数据整理成指标摘要、异常点、分组统计和可导出的表格结构。",
  },
  {
    id: "presentations",
    name: "Presentations 汇报提纲",
    keywords: /ppt|演示|汇报|提纲|路演|展示|汇报材料|领导汇报/i,
    instruction: "将材料压缩成汇报逻辑、页面标题、关键论点和讲述顺序，便于后续生成 PPT。",
  },
  {
    id: "mail",
    name: "Gmail 邮件整理",
    keywords: /邮件|email|gmail|收件|回复|通知|群发|抄送|催办/i,
    instruction: "生成邮件、通知、催办和回复草稿，语气正式、事项明确、便于直接发送。",
  },
];

function inferAgentSkills(text = "") {
  const matched = OFFICE_AGENT_SKILLS.filter((skill) => skill.keywords.test(text));
  if (matched.length) return matched;
  return [OFFICE_AGENT_SKILLS[0]];
}

function agentOfficeConfig(prompt) {
  const recentUserText = state.chatMessages.filter((message) => message.role === "user").map((message) => message.content).join("\n\n");
  const inputText = recentUserText || prompt;
  const skills = inferAgentSkills(`${prompt}\n${inputText}`);
  return {
    taskType: inferAgentTaskType(`${prompt}\n${inputText}`),
    title: summarizeTextForTitle(prompt) || "OfficeFlow 办公结果",
    audience: "当前用户",
    department: "个人办公",
    style: "正式规范",
    inputText,
    skills: skills.map(({ id, name, instruction }) => ({ id, name, instruction })),
  };
}

async function generateAgentOfficeResult(prompt) {
  const body = await apiFetch("/api/office-agent", {
    method: "POST",
    body: JSON.stringify({ config: agentOfficeConfig(prompt), aiSettings: activeAiSettings() }),
  });
  const output = body.result || {};
  const conversation = currentConversation();
  if (conversation) {
    conversation.officeResult = output;
    state.lastResultConversationId = conversation.id;
    saveConversations();
  }
  renderOutput(output);
  dom.mainResultPanel?.scrollIntoView({ block: "start", behavior: "smooth" });
  const format = inferExportFormat(prompt);
  if (format && format !== "pdf") {
    const fileBody = await apiFetch("/api/export-file", {
      method: "POST",
      body: JSON.stringify({ format, output }),
    });
    downloadBase64File(fileBody);
    return `已生成办公结果，并导出 ${fileBody.filename}。`;
  }
  if (format === "pdf") {
    exportPdfByPrint(output);
    return "已生成办公结果，并打开 PDF 打印/另存窗口。";
  }
  return `已生成办公结果：${output.title || "办公处理结果"}。你可以在结果区查看并导出文件。`;
}

async function readAgentFile(file) {
  if (!file) return;
  ensureConversation();
  state.chatMessages.push({ role: "user", name: "你", content: `上传文件：${file.name}` });
  state.chatMessages.push({ role: "assistant", name: "OfficeFlow AI", content: `正在读取 ${file.name}，稍等一下。` });
  renderChatMessages();
  syncActiveConversation();
  const textExtensions = /\.(txt|md|csv|json|log)$/i;
  try {
    let text = "";
    let note = "";
    if (textExtensions.test(file.name)) {
      const result = await readLocalTextPreview(file);
      text = result.text;
      note = result.note;
    } else {
      const body = await extractFileViaApi(file);
      text = body.text || "";
      note = body.note || "";
    }
    const clipped = text.length > 12000 ? `${text.slice(0, 12000)}\n\n（内容较长，已截取前 12000 字供本次 Agent 处理。）` : text;
    state.chatMessages = state.chatMessages.filter((message) => !message.content?.startsWith("正在读取 "));
    state.chatMessages.push({
      role: "user",
      name: "你",
      content: `文件内容：${file.name}\n\n${clipped}`,
    });
    state.chatMessages.push({
      role: "assistant",
      name: "OfficeFlow AI",
      content: `${note || `已读取 ${file.name}。`} 你可以继续提出处理要求。`,
    });
  } catch (error) {
    state.chatMessages.push({ role: "assistant", name: "OfficeFlow AI", content: `文件处理失败：${error.message}` });
  }
  renderChatMessages();
  syncActiveConversation();
}

sendAgentChat = async function (event) {
  event.preventDefault();
  const prompt = dom.agentChatInput.value.trim();
  if (!prompt) return;
  ensureConversation();
  state.chatMessages.push({ role: "user", content: prompt, name: "你" });
  const conversation = currentConversation();
  if (conversation && conversation.title === "新对话") conversation.title = summarizeTextForTitle(prompt);
  dom.agentChatInput.value = "";
  renderChatMessages();
  syncActiveConversation();
  setBusy(dom.agentChatSendButton, true);
  try {
    const shouldUseOfficeAgent = /生成|导出|整理|纪要|公文|通知|合同|数据|统计|检索|修正|word|docx|pdf|excel|xlsx/i.test(prompt);
    if (shouldUseOfficeAgent && !state.staticMode) {
      const content = await generateAgentOfficeResult(prompt);
      state.chatMessages.push({ role: "assistant", content, name: "OfficeFlow Agent" });
    } else if (state.staticMode) {
      state.chatMessages.push({ role: "assistant", content: STATIC_MODE_MESSAGE, name: "OfficeFlow AI" });
    } else {
      const body = await apiFetch("/api/ai-chat", {
        method: "POST",
        body: JSON.stringify({
          messages: state.chatMessages.map(({ role, content }) => ({ role, content })),
          aiSettings: activeAiSettings(),
        }),
      });
      state.chatMessages.push({
        role: "assistant",
        content: body.result?.content || "模型没有返回内容。",
        name: body.result?.modelProvider || "OfficeFlow AI",
      });
    }
  } catch (error) {
    state.chatMessages.push({ role: "assistant", content: `处理失败：${error.message}`, name: "OfficeFlow Agent" });
  } finally {
    setBusy(dom.agentChatSendButton, false);
    renderChatMessages();
    syncActiveConversation();
  }
};

const originalWireEvents = wireEvents;
wireEvents = function () {
  originalWireEvents();
  removeLegacyTutorialAndDecor();
  ensureAgentControls();
  dom.conversationList.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite-conversation-id]");
    if (!favoriteButton) return;
    event.preventDefault();
    event.stopPropagation();
    toggleConversationFavorite(favoriteButton.dataset.favoriteConversationId);
  }, true);
  document.addEventListener("click", (event) => {
    const resultFavorite = event.target.closest("[data-result-favorite]");
    if (!resultFavorite) return;
    event.preventDefault();
    toggleResultFavorite();
  });
  document.querySelector("#agentAttachButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#agentAttachMenu");
    if (menu) menu.hidden = !menu.hidden;
  });
  document.querySelector("#agentAttachMenu")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = event.target.closest("[data-agent-action]")?.dataset.agentAction;
    const skillId = event.target.closest("[data-agent-skill]")?.dataset.agentSkill;
    if (!action && !skillId) return;
    document.querySelector("#agentAttachMenu").hidden = true;
    if (action === "upload") {
      document.querySelector("#agentFileInput")?.click();
      return;
    }
    if (skillId) {
      const skill = OFFICE_AGENT_SKILLS.find((item) => item.id === skillId);
      const pluginPrompt = skill ? `启用 ${skill.name} Skill：${skill.instruction}` : "";
      const current = dom.agentChatInput.value.trim();
      dom.agentChatInput.value = current ? `${current}\n${pluginPrompt}` : pluginPrompt;
      dom.agentChatInput.focus();
    }
  });
  document.addEventListener("click", (event) => {
    const menu = document.querySelector("#agentAttachMenu");
    const button = document.querySelector("#agentAttachButton");
    if (!menu || menu.hidden) return;
    if (menu.contains(event.target) || button?.contains(event.target)) return;
    menu.hidden = true;
  });
  document.querySelector("#agentFileInput")?.addEventListener("change", (event) => {
    readAgentFile(event.target.files?.[0]);
    event.target.value = "";
  });
};

async function init() {
  loadAiConfig();
  loadConversations();
  wireEvents();
  renderDashboard();
  await loadTemplates();
  await loadWorkflows();
}

init().catch((error) => {
  setResult("启动失败", error.message);
});
