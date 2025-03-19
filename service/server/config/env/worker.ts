import { z } from "zod";
import type { ApplicationService } from "../../cmd/server/internal/application";
import { zCommonEnv } from "./common";
import { zFeatureFlagEnv } from "./flag";
export const zBindingAppWorkerEnv = z
  .object({
    APP_WORKER: z.custom<Service<ApplicationService>>(),
  })
  .merge(zCommonEnv)
  .merge(zFeatureFlagEnv);

export type BindingAppWorkerEnv = z.infer<typeof zBindingAppWorkerEnv>;
