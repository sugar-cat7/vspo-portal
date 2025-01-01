import { z } from "zod";
import type { ApplicationService } from "../../cmd/server/internal/application";

export const zBindingWorkerEnv = z.object({
  APP_WORKER: z.custom<Service<ApplicationService>>(),
});

export type BindingAppWorkerEnv = z.infer<typeof zBindingWorkerEnv>;
