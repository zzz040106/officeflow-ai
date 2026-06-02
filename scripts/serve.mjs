import { resolve } from "node:path";

import { listenApiServer } from "../server/apiServer.mjs";

const port = Number(process.env.PORT || 5173);

listenApiServer({
  root: resolve(process.cwd()),
  dataDir: resolve(process.cwd(), "data"),
  host: process.env.HOST || "127.0.0.1",
  port,
  attemptsLeft: Number(process.env.PORT_AUTO || 0) ? 10 : 1,
});
