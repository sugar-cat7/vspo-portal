import { getContext } from "hono/context-storage";
import type { RequestIdVariables } from "hono/request-id";
import type { ApiEnv } from "../../../config/env/api";
import type { AppLogger } from "../../../pkg/logging";

export type ServiceContext = {
  logger: AppLogger;
};

export type HonoEnv = {
  Bindings: ApiEnv;
  Variables: {
    services: ServiceContext;
  } & RequestIdVariables;
};

export const getLogger = () => {
  return getContext<HonoEnv>()?.var?.services?.logger;
};
