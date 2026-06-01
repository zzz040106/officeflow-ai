import { getPath, interpolateTemplate } from "./workflowEngine.js";

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[?::1\]?$/i,
];

export function assertSafeOutboundUrl(url) {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS API URLs are supported");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error(`Outbound API host is not allowed: ${hostname}`);
  }
}

export function buildHttpRequestUrl(config, context = {}) {
  const url = new URL(interpolateTemplate(config.url, context));

  for (const [key, value] of Object.entries(config.query || {})) {
    if (value == null || value === "") {
      continue;
    }
    url.searchParams.set(key, interpolateTemplate(value, context));
  }

  assertSafeOutboundUrl(url);
  return url;
}

export function mapOutput(body, outputMap = {}) {
  return Object.fromEntries(
    Object.entries(outputMap).map(([key, path]) => [key, getPath(body, path)]),
  );
}

function normalizeHeaders(headers = {}, context = {}) {
  return Object.fromEntries(
    Object.entries(headers)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => [key, interpolateTemplate(value, context)]),
  );
}

function normalizeBody(config, context) {
  if (!config.body || config.method === "GET") {
    return undefined;
  }

  return interpolateTemplate(config.body, context);
}

export async function executeHttpRequestNode(config, options = {}) {
  const context = options.context || {};
  const fetchImpl = options.fetchImpl || fetch;
  const method = String(config.method || "GET").toUpperCase();
  const url = buildHttpRequestUrl({ ...config, method }, context);
  const controller = new AbortController();
  const timeoutMs = Number(config.timeoutMs || 10000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method,
      headers: normalizeHeaders(config.headers, context),
      body: normalizeBody({ ...config, method }, context),
      signal: controller.signal,
    });

    const contentType = response.headers?.get?.("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(`API request failed with ${response.status}`);
    }

    return {
      status: response.status,
      url: url.toString(),
      body,
      output: typeof body === "object" && body !== null ? mapOutput(body, config.outputMap) : {},
    };
  } finally {
    clearTimeout(timeout);
  }
}
