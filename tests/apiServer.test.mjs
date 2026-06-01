import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { createApiServer } from "../server/apiServer.mjs";

async function withTestServer(t, options = {}) {
  const dataDir = await mkdtemp(join(tmpdir(), "mini-zapier-api-"));
  t.after(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  const server = createApiServer({
    root: process.cwd(),
    dataDir,
    fetchImpl:
      options.fetchImpl ||
      (async () => ({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ current: { rain: 0.9, temperature: 18.6 } }),
      })),
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("GET /api/templates returns office automation workflow templates", async (t) => {
  const baseUrl = await withTestServer(t);
  const response = await fetch(`${baseUrl}/api/templates`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.templates.some((template) => template.id === "document-minutes"));
  assert.ok(body.templates.some((template) => template.id === "document-polish"));
  assert.ok(body.templates.some((template) => template.id === "contract-summary"));
  assert.ok(body.templates.some((template) => template.id === "data-summary"));
  assert.equal(
    body.templates.find((template) => template.id === "document-minutes").workflow.nodes[1].type,
    "aiOfficeTask",
  );
});

test("POST /api/proxy-request executes and maps a custom API request", async (t) => {
  const baseUrl = await withTestServer(t);
  const response = await fetch(`${baseUrl}/api/proxy-request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      request: {
        method: "GET",
        url: "https://api.example.com/weather",
        outputMap: {
          rain: "current.rain",
        },
      },
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.result.output.rain, 0.9);
  assert.equal(body.result.status, 200);
});

test("POST /api/workflows saves a workflow and GET /api/workflows lists it", async (t) => {
  const baseUrl = await withTestServer(t);
  const workflow = {
    id: "custom-workflow",
    name: "Custom API Monitor",
    nodes: [{ id: "trigger", type: "manualTrigger", label: "Trigger" }],
  };

  const saveResponse = await fetch(`${baseUrl}/api/workflows`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workflow }),
  });
  const listResponse = await fetch(`${baseUrl}/api/workflows`);
  const body = await listResponse.json();

  assert.equal(saveResponse.status, 200);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(body.workflows[0], workflow);
});

test("DELETE /api/workflows/:id removes a saved workflow", async (t) => {
  const baseUrl = await withTestServer(t);
  const workflow = {
    id: "delete-me",
    name: "Delete Me",
    nodes: [{ id: "trigger", type: "manualTrigger", label: "Trigger" }],
  };

  await fetch(`${baseUrl}/api/workflows`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workflow }),
  });

  const deleteResponse = await fetch(`${baseUrl}/api/workflows/delete-me`, {
    method: "DELETE",
  });
  const deleteBody = await deleteResponse.json();
  const listResponse = await fetch(`${baseUrl}/api/workflows`);
  const listBody = await listResponse.json();

  assert.equal(deleteResponse.status, 200);
  assert.deepEqual(deleteBody, {
    ok: true,
    workflowId: "delete-me",
    deleted: true,
  });
  assert.deepEqual(listBody.workflows, []);
});

test("POST /api/workflows/run executes workflow and records notify action", async (t) => {
  const baseUrl = await withTestServer(t);
  const response = await fetch(`${baseUrl}/api/workflows/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      workflow: {
        id: "run-test",
        name: "Run Test",
        nodes: [
          { id: "trigger", type: "manualTrigger", label: "Trigger" },
          {
            id: "api",
            type: "httpRequest",
            label: "API",
            config: {
              method: "GET",
              url: "https://api.example.com/weather",
              outputMap: { rain: "current.rain" },
            },
          },
          {
            id: "ifRain",
            type: "condition",
            label: "If Rain",
            config: {
              condition: { left: "api.output.rain", operator: ">", right: 0 },
            },
          },
          {
            id: "notify",
            type: "notify",
            label: "Notify",
            config: {
              when: "ifRain",
              message: "Rain is {{api.output.rain}}mm",
            },
          },
        ],
      },
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.result.context.ifRain.result, true);
  assert.deepEqual(body.actions, [{ type: "notify", message: "Rain is 0.9mm" }]);
  assert.equal(body.result.logs.length, 4);
});
