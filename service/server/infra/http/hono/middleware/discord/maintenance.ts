import { OpenFeature } from "@openfeature/server-sdk";
import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../../env";

export const maintenanceMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const client = OpenFeature.getClient();
    const enabled = await client.getBooleanValue(
      "discord-bot-maintenance",
      false,
    );
    if (enabled) {
      return c.text("Bot is under maintenance", 403);
    }
    await next();
  },
);
