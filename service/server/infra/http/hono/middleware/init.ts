import { env } from "hono/adapter";
import { createMiddleware } from "hono/factory";
import { type ApiEnv, zApiEnv } from "../../../../config/env/api";
import { AppError, ErrorCodeSchema } from "../../../../pkg/errors";
import { AppLogger } from "../../../../pkg/logging";
import type { AppContext } from "../app";
import type { HonoEnv } from "../env";

export const init = createMiddleware<HonoEnv>(async (c, next) => {
  const honoEnv = env<ApiEnv, AppContext>(c);
  const e = zApiEnv.safeParse(honoEnv);
  if (!e.success) {
    throw new AppError({
      code: ErrorCodeSchema.Enum.BAD_REQUEST,
      message: e.error.message,
    });
  }
  const logger = AppLogger.getInstance(e.data);
  c.set("services", {
    logger: logger,
  });
  logger.info("[Request started]");
  await next();
});
