import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";

import { resolveRequestPath } from "../scripts/staticServer.mjs";

test("resolveRequestPath maps the root URL to index.html", () => {
  assert.equal(resolveRequestPath("/", process.cwd()), resolve(process.cwd(), "index.html"));
});

test("resolveRequestPath maps normal asset URLs inside the project root", () => {
  assert.equal(
    resolveRequestPath("/src/app.js", process.cwd()),
    resolve(process.cwd(), "src/app.js"),
  );
});

test("resolveRequestPath blocks path traversal outside the project root", () => {
  assert.equal(resolveRequestPath("/../package.json", process.cwd()), null);
});
