import { z } from "zod";
import type { ApplicationService } from "../../cmd/server/internal/application";
import { zCommonEnv } from "./common";

export const zBindingAppWorkerEnv = z
  .object({
    APP_WORKER: z.custom<Service<ApplicationService>>(),
  })
  .merge(zCommonEnv);

export type BindingAppWorkerEnv = z.infer<typeof zBindingAppWorkerEnv>;
