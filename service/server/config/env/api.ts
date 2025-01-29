import type { z } from "zod";
import { zCommonEnv } from "./common";
import { zBindingAppWorkerEnv } from "./worker";

export const zApiEnv = zBindingAppWorkerEnv.merge(zCommonEnv);
export type ApiEnv = z.infer<typeof zApiEnv>;
