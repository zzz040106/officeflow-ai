export const templates = [
  {
    id: "document-minutes",
    name: "会议纪要整理",
    description: "粘贴会议记录，自动整理结论、待办、负责人和下一步。",
    office: {
      taskType: "meeting",
      title: "项目周会纪要",
      audience: "项目组",
      department: "总经理办公室",
      style: "正式精简",
      inputText:
        "本周项目周会：销售侧反馈客户关注交付周期，运营需要下周三前补齐报价表，财务希望统一合同归档口径。张明负责整理客户问题，李娜负责更新报价模板，周五前同步给总经理。",
    },
    condition: { left: "ai.ready", operator: "===", right: true },
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
      inputText:
        "请各部门这周把上个月客户资料整理一下，格式尽量统一，周五前发给办公室。后面要做一次客户信息归档，缺的字段要补齐。",
    },
    condition: { left: "ai.ready", operator: "===", right: true },
    message: "{{ai.title}} 已润色完成，请确认发布对象和日期。",
  },
  {
    id: "format-correction",
    name: "格式/内容修正",
    description: "按公司固定文档格式修正文稿，指出格式偏差、缺失要素和错别字。",
    office: {
      taskType: "format",
      title: "文档格式与内容修正",
      audience: "提交部门",
      department: "总经理办公室",
      style: "公司标准文档",
      inputText:
        "各部门这周把客户资料整理一下，格式尽量统一，周五前给办公室。后面要做客户信息归档，缺的字段要补齐。",
    },
    condition: { left: "ai.ready", operator: "===", right: true },
    message: "{{ai.title}} 已修正完成，请复核格式问题和错别字清单。",
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
      inputText:
        "甲方委托乙方提供年度客户数据整理服务，服务期 12 个月，总金额 98000 元，分两期付款。乙方需在每月 5 日前提交数据报告，甲方验收后 10 个工作日内付款。若延期交付，应按合同金额 0.5%/日承担违约责任。",
    },
    condition: { left: "ai.ready", operator: "===", right: true },
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
      inputText:
        "本月线索 186 条，成交 31 单，成交率 16.7%。上月线索 142 条，成交 22 单。华东区域增长明显，华南区域跟进周期偏长。",
    },
    condition: { left: "ai.ready", operator: "===", right: true },
    message: "{{ai.title}} 已完成，建议补充原始表格后归档。",
  },
  {
    id: "research-brief",
    name: "信息检索助手",
    description: "根据上传材料自动联网检索相关信息，整理链接、来源摘要和可汇报建议。",
    office: {
      taskType: "research",
      title: "行业信息简报",
      audience: "业务负责人",
      department: "市场部",
      style: "决策参考",
      inputText:
        "近期客户更关注 AI 办公、自动化报表、合同智能检索。竞品强调低门槛模板和企业知识库接入，价格多采用按席位订阅。",
    },
    condition: { left: "ai.ready", operator: "===", right: true },
    message: "{{ai.title}} 已生成，适合放入汇报材料。",
  },
];

export function createWorkflowFromTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    templateId: template.id,
    nodes: [
      { id: "trigger", type: "manualTrigger", label: "提交材料" },
      { id: "api", type: "aiOfficeTask", label: template.name, config: template.office },
      {
        id: "condition",
        type: "condition",
        label: "复核条件",
        config: { condition: template.condition },
      },
      {
        id: "notify",
        type: "notify",
        label: "完成提醒",
        config: { when: "condition", message: template.message },
      },
    ],
  };
}
