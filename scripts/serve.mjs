import { resolve } from "node:path";

import { listenApiServer } from "../server/apiServer.mjs";

listenApiServer({
  root: resolve(process.cwd()),
  dataDir: resolve(process.cwd(), "data"),
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 5173),
});
