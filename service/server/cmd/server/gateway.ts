import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import type { ApiEnv } from "../../config/env/api";
import { newApp } from "../../infra/http/hono/app";
import { init } from "../../infra/http/hono/middleware";
import { createHandler, withTracer } from "../../infra/http/otel";
import { registerCreatorListApi, registerVideoListApi } from "../../routes";

const app = newApp();
app.notFound((c) => {
  return c.text("Not Found", 404);
});
app.get("/health", (c) => {
  return c.text("OK");
});

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["*"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
  }),
  requestId(),
  init,
);
registerVideoListApi(app);
registerCreatorListApi(app);

export default createHandler({
  fetch: async (req: Request, env: ApiEnv, executionCtx: ExecutionContext) => {
    return await withTracer("OTelCFWorkers:Fetcher", "Exec", async () => {
      return app.fetch(req, env, executionCtx);
    });
  },
});
