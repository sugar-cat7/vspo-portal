import { DiscordHono } from "discord-hono";
import type { ApiEnv } from "../../config/env/api";
import {
  announceCommand,
  spoduleSettingCommand,
} from "../../infra/discord/command";
import { newApp } from "../../infra/http/hono/app";
import { createHandler, withTracer } from "../../infra/http/otel";

const app = newApp();
app.notFound((c) => {
  return c.text("Not Found", 404);
});
app.get("/health", (c) => {
  return c.text("OK");
});

const discord = new DiscordHono()
  .command(spoduleSettingCommand.name, spoduleSettingCommand.handler)
  .command(announceCommand.name, announceCommand.handler);
app.mount("/interaction", discord.fetch);

// app.use(
//   "*",
//   cors({
//     origin: "*",
//     allowHeaders: ["*"],
//     allowMethods: ["POST", "GET", "OPTIONS"],
//     exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
//     maxAge: 600,
//   }),
//   requestId(),
//   init,
// );
// registerVideoListApi(app);
// registerCreatorListApi(app);

export default createHandler({
  fetch: async (req: Request, env: ApiEnv, executionCtx: ExecutionContext) => {
    return await withTracer("OTelCFWorkers:Fetcher", "Exec", async () => {
      return app.fetch(req, env, executionCtx);
    });
  },
});
