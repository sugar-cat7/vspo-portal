import type { z } from "zod";
import { zCommonEnv } from "./common";
import { zBindingWorkerEnv } from "./worker";

export const zApiEnv = zBindingWorkerEnv.merge(zCommonEnv);
export type ApiEnv = z.infer<typeof zApiEnv>;
