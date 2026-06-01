# OfficeFlow AI

OfficeFlow AI 是一个面向办公效率优化的本地网页应用。它把会议纪要、公文润色、合同摘要、数据统计、信息检索等常见办公任务封装成可直接使用的 AI Agent 工作台。

## 功能亮点

- 办公场景库：会议纪要整理、公文/通知润色、合同摘要提取、数据统计助手、信息检索助手、格式/内容修正。
- AI Agent 对话：支持上传文件、输入办公需求，并自动匹配合适的办公 Skill。
- 办公 Skill：内置 Documents、Spreadsheets、Presentations、Gmail 等能力提示。
- 文件处理：支持文本、CSV、Word `.docx`、Excel `.xlsx/.xlsm/.xltx`、PDF 等材料。
- 文件导出：支持根据业务结果导出 Word、Excel，PDF 可通过浏览器打印另存。
- 本地演示：未配置大模型 API Key 时，也可以使用本地演示逻辑跑通主要流程。

## 快速开始

先安装 Node.js，然后在项目根目录运行：

```bash
npm start
```

启动成功后，终端会显示类似下面的提示：

```text
OfficeFlow AI running at ...
```

复制终端中显示的地址，在浏览器中打开即可。

运行测试：

```bash
npm test
```

## 使用方式

1. 在左侧选择一个办公场景，例如“会议纪要整理”。
2. 上传、拖入或粘贴办公材料。
3. 填写标题、面向对象、所属部门等基础信息。
4. 点击“生成纪要/生成内容”。
5. 在结果卡片中查看摘要、要点、待办和复核清单。
6. 根据需要导出 Word、Excel 或 PDF。

也可以直接在底部 Agent 对话框中上传文件并输入需求，例如：

```text
把这份合同提取成摘要并导出 Word
```

## AI 模型配置

应用支持配置多个大模型 Provider：

- OpenAI
- Claude
- DeepSeek
- Kimi
- Qwen

API Key 只保存在本地浏览器或本地运行环境中。配置 API Key 后，可以调用真实大模型生成内容；不配置也可以使用本地演示模式体验主要流程。
