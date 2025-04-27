import type { RequestIdVariables } from "hono/request-id";
import type { ApiEnv } from "../../../config/env/api";

export type HonoEnv = {
  Bindings: ApiEnv;
  Variables: RequestIdVariables;
};
