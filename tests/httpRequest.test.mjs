import assert from "node:assert/strict";
import test from "node:test";

import { executeHttpRequestNode } from "../src/httpRequest.js";
import { runWorkflow } from "../src/workflowEngine.js";

test("executeHttpRequestNode builds URL with query values and maps JSON output", async () => {
  const calls = [];
  const result = await executeHttpRequestNode(
    {
      method: "GET",
      url: "https://api.example.com/weather",
      query: {
        city: "{{city}}",
        units: "metric",
      },
      headers: {
        "X-Workflow": "mini-zapier",
      },
      outputMap: {
        temperature: "current.temperature",
        rain: "current.rain",
      },
    },
    {
      context: { city: "Nanjing" },
      fetchImpl: async (url, init) => {
        calls.push({ url: url.toString(), init });
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            current: {
              temperature: 18.6,
              rain: 0.8,
            },
          }),
        };
      },
    },
  );

  assert.equal(calls[0].url, "https://api.example.com/weather?city=Nanjing&units=metric");
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.headers["X-Workflow"], "mini-zapier");
  assert.deepEqual(result.output, { temperature: 18.6, rain: 0.8 });
  assert.equal(result.status, 200);
});

test("executeHttpRequestNode rejects local and private hosts", async () => {
  await assert.rejects(
    executeHttpRequestNode(
      {
        method: "GET",
        url: "http://127.0.0.1:3000/secrets",
      },
      { fetchImpl: async () => ({ ok: true }) },
    ),
    /not allowed/i,
  );
});

test("runWorkflow executes a generic httpRequest node and conditions against mapped output", async () => {
  const workflow = [
    { id: "trigger", type: "manualTrigger", label: "Button Trigger" },
    {
      id: "api",
      type: "httpRequest",
      label: "Custom API",
      config: {
        method: "GET",
        url: "https://api.example.com/data",
        outputMap: {
          rain: "current.rain",
        },
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
  ];

  const messages = [];
  const result = await runWorkflow(workflow, {
    services: {
      httpRequest: async () => ({
        status: 200,
        body: { current: { rain: 1.2 } },
        output: { rain: 1.2 },
      }),
      notify: async (message) => messages.push(message),
    },
  });

  assert.equal(result.context.api.output.rain, 1.2);
  assert.deepEqual(messages, ["Rain is 1.2mm"]);
  assert.equal(result.context.ifRain.result, true);
});
