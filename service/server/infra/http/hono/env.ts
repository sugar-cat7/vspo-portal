import { getContext } from "hono/context-storage";
// import type { Tracer } from '@opentelemetry/api'
import type { RequestIdVariables } from "hono/request-id";
import type { AppEnv } from "../../../config/env";
import type { AppLogger } from "../../../pkg/logging";

export type ServiceContext = {
  logger: AppLogger;
};

export type HonoEnv = {
  Bindings: AppEnv;
  Variables: {
    services: ServiceContext;
  } & RequestIdVariables;
};

export const getLogger = () => {
  return getContext<HonoEnv>()?.var?.services?.logger;
};
