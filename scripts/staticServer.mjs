import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import {
  extname,
  isAbsolute,
  join,
  normalize,
  resolve,
  sep,
} from "node:path";

export const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

export function resolveRequestPath(urlPath, baseRoot = process.cwd()) {
  const root = resolve(baseRoot);
  const rawPath = String(urlPath || "/").split(/[?#]/)[0];
  const decodedPath = decodeURIComponent(rawPath);
  const segments = decodedPath.split(/[/\\]+/).filter(Boolean);

  if (segments.includes("..")) {
    return null;
  }

  const relativePath = segments.join(sep) || "index.html";
  const safePath = normalize(relativePath);

  if (
    isAbsolute(safePath) ||
    safePath === ".." ||
    safePath.startsWith(`..${sep}`) ||
    safePath.startsWith("../")
  ) {
    return null;
  }

  const resolved = resolve(join(root, safePath));

  if (resolved !== root && !resolved.startsWith(`${root}${sep}`)) {
    return null;
  }

  if (!existsSync(resolved)) {
    return resolve(root, "index.html");
  }

  if (statSync(resolved).isDirectory()) {
    return resolve(resolved, "index.html");
  }

  return resolved;
}

export function createStaticServer({ root = process.cwd() } = {}) {
  return createServer((request, response) => {
    const filePath = resolveRequestPath(request.url || "/", root);

    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    response.writeHead(200, {
      "Content-Type":
        contentTypes[extname(filePath)] || "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });

    const stream = createReadStream(filePath);
    stream.on("error", () => {
      response.writeHead(404);
      response.end("Not found");
    });
    stream.pipe(response);
  });
}

export function listenWithFallback({
  host = "127.0.0.1",
  port = 5173,
  attemptsLeft = 10,
  root = process.cwd(),
} = {}) {
  const server = createStaticServer({ root });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 1) {
      listenWithFallback({
        host,
        port: port + 1,
        attemptsLeft: attemptsLeft - 1,
        root,
      });
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    console.log(`OfficeFlow AI static server running at http://${host}:${port}`);
  });

  return server;
}
