import { DiscordHono } from "discord-hono";
import type { ApiEnv } from "../../config/env/api";
import {
  type DiscordCommandEnv,
  botAddComponent,
  botRemoveComponent,
  cancelComponent,
  langSelectComponent,
  langSettingComponent,
  spoduleSettingCommand,
  yesBotRemoveComponent,
} from "../../infra/discord/command";
import { newApp } from "../../infra/http/hono/app";
import { createHandler, withTracer } from "../../infra/http/trace";

const app = newApp();
app.notFound((c) => {
  return c.text("Not Found", 404);
});
app.get("/health", (c) => {
  return c.text("OK");
});

const discord = new DiscordHono<DiscordCommandEnv>()
  //setting
  .command(spoduleSettingCommand.name, spoduleSettingCommand.handler)
  .component(botAddComponent.name, botAddComponent.handler)
  .component(botRemoveComponent.name, botRemoveComponent.handler)
  .component(yesBotRemoveComponent.name, yesBotRemoveComponent.handler)
  .component(langSettingComponent.name, langSettingComponent.handler)
  .component(langSelectComponent.name, langSelectComponent.handler)
  //common
  .component(cancelComponent.name, cancelComponent.handler);

app.mount("/interaction", discord.fetch);

// app.use(
//   "*",
//   // cors({
//   //   origin: "*",
//   //   allowHeaders: ["*"],
//   //   allowMethods: ["POST", "GET", "OPTIONS"],
//   //   exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
//   //   maxAge: 600,
//   // }),
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
