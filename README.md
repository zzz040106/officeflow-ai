# OfficeFlow AI

OfficeFlow AI 是一个面向办公效率优化的本地网页应用原型。它把常见办公场景封装成可直接运行的 AI Agent 工作台，适合用于演示“AI 自动化办公体系”的设计与落地能力。

## 功能亮点

- 办公场景库：会议纪要整理、公文/通知润色、合同摘要提取、数据统计助手、信息检索助手、格式/内容修正。
- AI Agent 对话：支持在对话框中上传文件、提出办公需求，并由系统自动选择合适的办公 Skill。
- 办公 Skill：内置 Documents、Spreadsheets、Presentations、Gmail 等能力提示，Agent 会根据用户输入自动匹配。
- 文件处理：支持上传或拖入文本、CSV、Word `.docx`、Excel `.xlsx/.xlsm/.xltx`、PDF 等材料。
- 文件导出：根据业务结果导出 Word、Excel，PDF 通过浏览器打印/另存为 PDF。
- 对话与收藏：用户对话和办公场景生成结果会进入对话记录，可收藏、删除和复用。
- 本地优先：数据默认保存在本地 JSON 或浏览器存储中，未配置大模型 API Key 时也可用演示逻辑跑通流程。

## 技术栈

- 前端：Vanilla HTML / CSS / JavaScript
- 后端：Node.js 原生 HTTP Server
- 存储：本地 JSON 文件与 LocalStorage
- 测试：Node.js `node:test`

## 快速开始

```bash
npm start
```

启动后打开：

```text
http://127.0.0.1:5173/
```

运行测试：

```bash
npm test
```

## 使用方式

1. 在左侧选择一个办公场景，例如“会议纪要整理”。
2. 上传、拖入或粘贴办公材料。
3. 填写标题、面向对象、所属部门等基础信息。
4. 点击“生成纪要/生成内容”。
5. 在结果卡片中查看摘要、要点、待办、复核清单，并按需导出 Word、Excel 或 PDF。
6. 也可以直接在底部 Agent 对话框中上传文件并输入需求，例如“把这份合同提取成摘要并导出 Word”。

## AI 模型配置

应用支持配置多个大模型 Provider，包括：

- OpenAI
- Claude
- Gemini
- DeepSeek
- Kimi
- Qwen

API Key 只保存在本地浏览器或本地运行环境中。上传 GitHub 前请不要提交真实 API Key、`.env` 文件或运行数据。

## 项目结构

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── styles.css
│   ├── officeAI.js
│   ├── workflowEngine.js
│   └── httpRequest.js
├── server/
│   ├── apiServer.mjs
│   ├── llmOfficeAI.mjs
│   ├── fileExtractor.mjs
│   ├── fileExporter.mjs
│   ├── store.mjs
│   └── templates.mjs
├── scripts/
│   └── serve.mjs
└── tests/
```

## 适合展示的能力点

- 将岗位要求中的“文档处理、数据统计、信息检索”拆成可运行的办公场景。
- 用 Agent + Skill 的方式降低普通用户操作门槛。
- 支持文件上传、AI 生成、结果复核、文件导出的闭环。
- 保留本地演示逻辑，面试时即使没有真实 API Key 也能展示完整流程。

## GitHub 上传前检查

`.gitignore` 已默认排除：

- `node_modules/`
- `data/`
- `output/`
- `.env`
- 本地 IDE/运行目录
- Claude 生成的对比副本 `AI自动化办公2/`

上传前建议再执行一次：

```bash
npm test
```
