import { createServer } from "node:http";
import { resolve } from "node:path";

import Busboy from "busboy";

import { executeHttpRequestNode } from "../src/httpRequest.js";
import { runWorkflow } from "../src/workflowEngine.js";
import { createStaticServer, resolveRequestPath } from "../scripts/staticServer.mjs";
import { extractUploadedFile } from "./fileExtractor.mjs";
import { exportOfficeFile } from "./fileExporter.mjs";
import { runOfficeAITask, runOfficeChat } from "./llmOfficeAI.mjs";
import { JsonStore } from "./store.mjs";
import { createWorkflowFromTemplate, templates } from "./templates.mjs";

const APP_VERSION = "officeflow-ai-upload-v3";

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 100_000_000) {
      throw new Error("Request body is too large");
    }
  }

  return raw ? JSON.parse(raw) : {};
}

const MAX_UPLOAD_BYTES = 120_000_000;

async function readRawBody(request, maxBytes = MAX_UPLOAD_BYTES) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error("Request body is too large");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseMultipartUpload(request) {
  return new Promise((resolveUpload, rejectUpload) => {
    let settled = false;
    const finish = (error, upload) => {
      if (settled) return;
      settled = true;
      if (error) rejectUpload(error);
      else resolveUpload(upload);
    };

    const busboy = Busboy({
      headers: request.headers,
      defParamCharset: "utf8",
      limits: {
        files: 1,
        fileSize: MAX_UPLOAD_BYTES,
      },
    });

    let upload = null;
    let total = 0;

    busboy.on("file", (_fieldName, file, info = {}) => {
      const chunks = [];
      const fileName = info.filename || "uploaded-file";
      const mimeType = info.mimeType || "";

      file.on("data", (chunk) => {
        total += chunk.length;
        chunks.push(chunk);
      });

      file.on("limit", () => {
        finish(new Error("文件超过 120MB，请拆分后上传。"));
        request.destroy();
      });

      file.on("end", () => {
        upload = {
          name: fileName,
          type: mimeType,
          dataBuffer: Buffer.concat(chunks, total),
        };
      });
    });

    busboy.on("error", (error) => finish(error));
    busboy.on("finish", () => {
      if (!upload) {
        finish(new Error("没有读取到上传文件，请重新选择文件。"));
        return;
      }
      finish(null, upload);
    });

    request.pipe(busboy);
  });
}

function createRuntimeServices({ fetchImpl, actions, aiSettings }) {
  return {
    httpRequest: async (config, context) =>
      executeHttpRequestNode(config, { context, fetchImpl }),
    officeAI: async (config) => runOfficeAITask(config, aiSettings, fetchImpl),
    notify: async (message) => {
      actions.push({ type: "notify", message });
    },
  };
}

async function executeWorkflow(workflow, fetchImpl, aiSettings = {}) {
  const actions = [];
  const result = await runWorkflow(workflow.nodes || [], {
    services: createRuntimeServices({ fetchImpl, actions, aiSettings }),
  });

  return { result, actions };
}

async function handleApiRequest(request, response, { store, fetchImpl }) {
  const url = new URL(request.url || "/", "http://local.test");

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, app: "OfficeFlow AI", version: APP_VERSION });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/templates") {
    sendJson(response, 200, {
      templates: templates.map((template) => ({
        ...template,
        workflow: createWorkflowFromTemplate(template),
      })),
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/workflows") {
    sendJson(response, 200, { workflows: await store.listWorkflows() });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/workflows") {
    const body = await readJsonBody(request);
    if (!body.workflow || typeof body.workflow !== "object") {
      sendJson(response, 400, { error: "workflow is required" });
      return true;
    }

    sendJson(response, 200, { workflow: await store.saveWorkflow(body.workflow) });
    return true;
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/workflows/")) {
    const workflowId = decodeURIComponent(url.pathname.slice("/api/workflows/".length));
    if (!workflowId) {
      sendJson(response, 400, { error: "workflow id is required" });
      return true;
    }

    const deleted = await store.deleteWorkflow(workflowId);
    sendJson(response, 200, { ok: true, workflowId, deleted });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/runs") {
    sendJson(response, 200, {
      runs: await store.listRuns(url.searchParams.get("workflowId")),
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/proxy-request") {
    const body = await readJsonBody(request);
    const result = await executeHttpRequestNode(body.request || {}, {
      context: body.context || {},
      fetchImpl,
    });
    sendJson(response, 200, { result });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/extract-file") {
    const contentType = request.headers["content-type"] || "";
    if (contentType.startsWith("multipart/form-data")) {
      const upload = await parseMultipartUpload(request);
      const result = await extractUploadedFile(upload);
      sendJson(response, 200, result);
      return true;
    }

    if (contentType.startsWith("application/octet-stream")) {
      const name = decodeURIComponent(request.headers["x-file-name"] || "uploaded-file");
      const type = request.headers["x-file-type"] || "";
      const dataBuffer = await readRawBody(request);
      const result = await extractUploadedFile({ name, type, dataBuffer });
      sendJson(response, 200, result);
      return true;
    }

    const body = await readJsonBody(request);
    if (!body.name || !body.dataBase64) {
      sendJson(response, 400, { error: "name and dataBase64 are required" });
      return true;
    }

    const result = await extractUploadedFile(body);
    sendJson(response, 200, result);
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/export-file") {
    const body = await readJsonBody(request);
    if (!body.output || !body.format) {
      sendJson(response, 400, { error: "output and format are required" });
      return true;
    }

    const result = await exportOfficeFile(body);
    sendJson(response, 200, result);
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/ai-chat") {
    const body = await readJsonBody(request);
    const result = await runOfficeChat(body.messages || [], body.aiSettings || {}, fetchImpl);
    sendJson(response, 200, { result });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/office-agent") {
    const body = await readJsonBody(request);
    const result = await runOfficeAITask(body.config || {}, body.aiSettings || {}, fetchImpl);
    sendJson(response, 200, { result });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/workflows/run") {
    const body = await readJsonBody(request);
    if (!body.workflow || typeof body.workflow !== "object") {
      sendJson(response, 400, { error: "workflow is required" });
      return true;
    }

    const runResult = await executeWorkflow(body.workflow, fetchImpl, body.aiSettings || {});
    await store.addRun({
      workflowId: body.workflow.id || "unsaved",
      workflowName: body.workflow.name || "Untitled Workflow",
      status: "success",
      logs: runResult.result.logs,
      actions: runResult.actions,
    });
    sendJson(response, 200, runResult);
    return true;
  }

  return false;
}

export function createApiServer({
  root = process.cwd(),
  dataDir = resolve(process.cwd(), "data"),
  fetchImpl = fetch,
} = {}) {
  const store = new JsonStore({ dataDir });
  const staticServer = createStaticServer({ root });

  return createServer(async (request, response) => {
    try {
      if ((request.url || "").startsWith("/api/")) {
        const handled = await handleApiRequest(request, response, {
          store,
          fetchImpl,
        });
        if (!handled) {
          sendJson(response, 404, { error: "API route not found" });
        }
        return;
      }

      const filePath = resolveRequestPath(request.url || "/", root);
      request.url = filePath ? request.url : "/404";
      staticServer.emit("request", request, response);
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export function listenApiServer({
  host = "127.0.0.1",
  port = 5173,
  attemptsLeft = 10,
  root = process.cwd(),
  dataDir = resolve(process.cwd(), "data"),
} = {}) {
  const server = createApiServer({ root, dataDir });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 1) {
      listenApiServer({
        host,
        port: port + 1,
        attemptsLeft: attemptsLeft - 1,
        root,
        dataDir,
      });
      return;
    }

    if (error.code === "EADDRINUSE") {
      console.error(
        `端口 ${port} 已被占用。请先关闭旧的 npm start 窗口，或运行 taskkill /F /IM node.exe 后重新 npm start。`,
      );
      process.exitCode = 1;
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    console.log(`OfficeFlow AI running at http://${host}:${port}`);
  });

  return server;
}

