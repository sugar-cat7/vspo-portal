import { z } from "zod";
import { zCommonEnv } from "./common";
import { zFeatureFlagEnv } from "./flag";
import { zBindingAppWorkerEnv } from "./worker";
export const zApiEnv = zBindingAppWorkerEnv
  .merge(zCommonEnv)
  .merge(zFeatureFlagEnv)
  .merge(
    z.object({
      API_KEY: z.string(),
    }),
  );
export type ApiEnv = z.infer<typeof zApiEnv>;
