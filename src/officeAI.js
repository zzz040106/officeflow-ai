function compactText(text, maxLength = 140) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "暂无输入内容，已按示例任务生成演示结果。";
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function countWords(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return 0;
  const latinWords = normalized.match(/[A-Za-z0-9]+/g) || [];
  const cjkChars = normalized.match(/[\u4e00-\u9fa5]/g) || [];
  return latinWords.length + cjkChars.length;
}

function buildReviewChecklist(taskType, config = {}) {
  const common = [
    "确认生成内容中的时间、金额、对象、责任人均能在原始材料中找到依据。",
    "确认 AI 补充或推断的内容已经由人工复核，不直接作为最终事实使用。",
    "确认导出文件的标题、部门、面向对象和用途与实际办公场景一致。",
  ];
  const byTask = {
    meeting: [
      "复核会议结论是否覆盖主要议题，待办事项是否包含责任人和截止时间。",
      "确认未把讨论意见误写成最终决策。",
    ],
    official: [
      "复核通知对象、执行要求、时间节点、落款和附件说明是否完整。",
      "确认语气正式、无口语化表达，适合直接发布。",
    ],
    format: [
      "复核修正后正文是否符合公司固定标题、正文、落款和日期格式。",
      "逐条确认格式不符项和错别字风险是否已经处理。",
    ],
    contract: [
      "复核合同主体、金额、期限、付款节点和违约责任是否准确。",
      "确认风险条款已交由业务负责人或法务复核。",
    ],
    data: [
      "复核原始数据来源、统计口径、同比/环比口径是否一致。",
      "确认异常数据已标注原因或后续跟进责任人。",
    ],
    research: [
      "复核联网检索摘要是否与用户材料主题一致，未把线索当作最终结论。",
      "正式汇报前确认来源机构、发布时间和原文语境。",
    ],
  };
  return [...common, ...(byTask[taskType] || [])];
}

const COMPANY_FORMAT_RULES = [
  "标题使用“关于XXX的通知/方案/报告”结构，居中、简洁，不使用口语化标题。",
  "正文采用“背景/目的、具体要求、时间节点、责任部门、联系人或附件说明”的顺序。",
  "落款统一为“总经理办公室”，日期使用“2026年5月31日”这类中文年月日格式。",
  "语气正式、准确，不使用“尽量、一个、后面”等口语表达。",
  "涉及时间、对象、材料、附件、责任人时必须写清楚，缺失信息要列入待补充项。",
];

const TASK_PRESETS = {
  meeting: {
    title: "会议纪要整理",
    summary: "已整理会议背景、关键结论和后续待办，适合发给参会人确认。",
    keyPoints: ["统一会议目标和当前进展", "识别需要负责人跟进的事项", "沉淀可复用的会议纪要格式"],
    todos: ["确认责任人与截止时间", "将纪要同步给相关部门", "下次会议前复核待办进度"],
    recommendation: "建议把会议纪要模板固定为“结论-待办-风险-下次节点”，方便团队形成统一协作习惯。",
  },
  official: {
    title: "公文/通知润色",
    summary: "已将原始材料改写为更正式、清晰、可发布的办公文稿。",
    keyPoints: ["统一行文口径", "压缩重复表达", "补齐通知对象、事项、时间和要求"],
    todos: ["确认发布对象和日期", "补充缺失的附件或联系人", "提交负责人做最终校对"],
    polishedDraft:
      "各部门：为进一步提升日常协作效率，请于本周内完成相关材料整理，并按统一模板提交至总经理办公室。请各负责人做好进度跟踪，确保信息准确、口径一致。",
    recommendation: "建议建立常用通知、公文、函件的 Prompt 模板库，减少反复润色和格式调整时间。",
  },
  format: {
    title: "格式/内容修正",
    summary: "已按公司固定文档格式检查并修正文稿，重点处理格式不一致、口语化表达、错别字和缺失要素。",
    keyPoints: ["套用公司标准通知/报告结构", "指出格式偏差与错别字风险", "生成可直接复核的修正版"],
    todos: ["补齐缺失的联系人、附件或日期", "由提交部门复核事实信息", "按公司文档模板归档"],
    formattedDraft:
      "关于规范客户资料归档工作的通知\n\n各部门：\n为统一客户资料管理口径，提升后续信息归档与查询效率，请各部门于本周五前完成上月客户资料整理工作，并按公司统一模板提交至总经理办公室。\n\n一、整理要求\n（一）客户基础信息、业务联系人、跟进状态等字段应填写完整。\n（二）资料格式应保持一致，缺失字段须在提交前补齐。\n（三）如需补充附件，请在文件末尾注明附件名称。\n\n二、时间要求\n请各部门于本周五17:00前完成提交。\n\n三、复核要求\n各部门负责人应对资料完整性、准确性进行复核后再提交。\n\n总经理办公室\n2026年5月31日",
    formatIssues: [
      "原文缺少正式标题、主送对象、落款和日期。",
      "原文未分段说明整理要求、时间要求和复核责任。",
      "“这周、整理一下、后面”等表达偏口语，不符合公司发布稿风格。",
    ],
    typoIssues: [
      "未发现确定性错别字；“字段要补齐”建议改为“缺失字段须补齐”，表达更正式。",
    ],
    recommendation: "建议所有对外或跨部门发布文档先经过“格式/内容修正”场景，确保格式统一、语气正式、信息完整。",
  },
  contract: {
    title: "合同摘要提取",
    summary: "已提取合同主体、关键条款、履约节点和需要人工复核的风险点。",
    keyPoints: ["识别合同双方和核心义务", "提取金额、期限、交付和违约条款", "标记需要法务或负责人确认的内容"],
    todos: ["核对合同主体和金额", "确认付款与交付节点", "交由法务复核风险条款"],
    riskItems: ["违约责任表述需要复核", "付款节点需与财务口径一致", "交付验收标准应补充附件依据"],
    recommendation: "建议合同类材料始终保留人工复核环节，AI 负责提取和提示，最终判断交给业务负责人和法务。",
  },
  data: {
    title: "数据统计摘要",
    summary: "已根据输入数据生成经营摘要、异常提示和下一步分析建议。",
    keyPoints: ["识别核心指标变化", "提取异常数据和可能原因", "生成适合汇报的指标说明"],
    todos: ["核对原始数据来源", "补充同比/环比口径", "将异常项分配给业务负责人复核"],
    recommendation: "建议把高频 Excel 统计项模板化，减少重复制表和人工描述时间。",
  },
  research: {
    title: "联网信息检索简报",
    summary: "已结合用户材料生成检索关键词，并整理相关来源、摘要、可参考结论和待核实事项。",
    keyPoints: ["提取材料中的核心主题作为检索方向", "汇总相关网页标题、链接和摘要", "区分可引用信息与待核实信息"],
    todos: ["人工打开重点链接复核来源可靠性", "补充公司内部业务判断", "将可引用来源放入汇报附件"],
    recommendation: "建议把外部检索结果作为线索，不直接当作最终结论；正式汇报前应复核来源时间、机构和原文语境。",
  },
};

export function simulateOfficeAITask(config = {}) {
  const taskType = config.taskType || "meeting";
  const preset = TASK_PRESETS[taskType] || TASK_PRESETS.meeting;
  const inputText = config.inputText || "";
  const audience = config.audience || "部门负责人";
  const department = config.department || "综合管理部";
  const style = config.style || "简洁专业";
  const outputStyles = Array.isArray(config.outputStyles) ? config.outputStyles : [];
  const words = countWords(inputText);
  const estimatedMinutesSaved = Math.max(15, Math.min(90, Math.round(words / 12) + 20));
  const sourceLinks = Array.isArray(config.webResults) ? config.webResults : [];

  return {
    ready: true,
    taskType,
    title: config.title || preset.title,
    audience,
    department,
    style,
    summary: `${preset.summary} 输入要点：${compactText(inputText)}`,
    keyPoints: preset.keyPoints,
    todos: preset.todos.map((todo, index) => ({
      owner: index === 0 ? "提交人" : department,
      item: todo,
      due: index === 0 ? "今日" : "本周内",
    })),
    metrics: {
      inputWords: words,
      estimatedMinutesSaved,
      sectionsGenerated: 4,
      reviewRequired: true,
    },
    reviewChecklist: buildReviewChecklist(taskType, config),
    ...(outputStyles.length
      ? {
          outputVariants: outputStyles.map((outputStyle) => ({
            style: outputStyle,
            content: `${outputStyle}版：${preset.summary} 建议基于原始材料复核责任人、截止时间和后续动作。`,
          })),
        }
      : {}),
    ...(preset.polishedDraft ? { polishedDraft: preset.polishedDraft } : {}),
    ...(preset.formattedDraft ? { formattedDraft: preset.formattedDraft } : {}),
    ...(preset.formatIssues ? { formatIssues: preset.formatIssues } : {}),
    ...(preset.typoIssues ? { typoIssues: preset.typoIssues } : {}),
    ...(preset.riskItems ? { riskItems: preset.riskItems } : {}),
    ...(sourceLinks.length
      ? {
          sourceLinks,
          keyPoints: [
            ...preset.keyPoints,
            `已找到 ${sourceLinks.length} 条外部来源线索，建议优先复核来源机构和发布时间。`,
          ],
        }
      : {}),
    ...(taskType === "format" ? { companyFormatRules: COMPANY_FORMAT_RULES } : {}),
    recommendation: preset.recommendation,
  };
}
