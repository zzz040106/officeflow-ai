# OfficeFlow AI

OfficeFlow AI 是一个面向办公效率优化的本地网页应用。它把会议纪要整理、公文/通知润色、合同摘要提取、数据统计、信息检索、格式/内容修正等常见办公任务封装成可直接使用的 AI Agent 工作台。

这个项目适合用于面试展示：可以体现 AI 工具落地、办公流程优化、文件处理、结果导出和本地 Web 应用开发能力。

## 功能亮点

- 办公场景库：会议纪要整理、公文/通知润色、合同摘要提取、数据统计助手、信息检索助手、格式/内容修正。
- AI Agent 对话：支持上传文件、输入办公需求，并自动匹配合适的办公 Skill。
- 办公 Skill：内置 Documents、Spreadsheets、Presentations、Gmail 等能力提示。
- 文件处理：支持文本、CSV、Word `.docx`、Excel `.xlsx/.xlsm/.xltx`、PDF 等材料。
- 文件导出：支持根据业务结果导出 Word、Excel；PDF 可通过浏览器打印另存。
- 本地演示：未配置大模型 API Key 时，也可以使用本地演示逻辑跑通主要流程。

## 下载后如何启动

先安装 Node.js，然后在项目根目录运行下面两条命令。

第一次下载后必须先安装依赖：

```bash
npm install
```

安装完成后再启动：

```bash
npm start
```

启动成功后，终端会显示类似：

```text
OfficeFlow AI running at http://127.0.0.1:5173
```

把终端里显示的地址复制到浏览器打开即可。

## 常见问题

### Cannot find package 'busboy'

如果启动时报错：

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'busboy'
```

说明还没有安装依赖。请在项目根目录运行：

```bash
npm install
```

然后重新启动：

```bash
npm start
```

### 页面打开了，但上传 Word / Excel / PDF 失败

请确认你不是直接双击 `index.html` 打开的页面。文件上传和 AI 接口需要本地服务支持，必须通过 `npm start` 启动后，再打开终端里显示的本地地址。

### 端口不是 5173 怎么办

如果 5173 被占用，程序会自动尝试下一个端口。以终端实际显示的地址为准。

## 使用方式

1. 在左侧选择一个办公场景，例如“会议纪要整理”。
2. 上传、拖入或粘贴办公材料。
3. 填写标题、面向对象、所属部门等基础信息。
4. 点击生成按钮。
5. 在结果卡片中查看摘要、要点、待办、复核清单等内容。
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

## 项目结构

```text
.
├── index.html
├── package.json
├── package-lock.json
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
└── scripts/
    └── serve.mjs
```

## 开发说明

本项目是本地演示型 Web 应用，默认不需要数据库。运行数据、收藏记录和对话记录主要保存在本地环境中，适合个人演示和面试讲解。
