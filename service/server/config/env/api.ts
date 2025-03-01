import type { z } from "zod";
import { zCommonEnv } from "./common";
import { zFeatureFlagEnv } from "./flag";
import { zBindingAppWorkerEnv } from "./worker";
export const zApiEnv = zBindingAppWorkerEnv
  .merge(zCommonEnv)
  .merge(zFeatureFlagEnv);
export type ApiEnv = z.infer<typeof zApiEnv>;
