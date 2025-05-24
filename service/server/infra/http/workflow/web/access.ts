import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import type { BindingAppWorkerEnv } from "../../../../config/env/worker";
import { zBindingAppWorkerEnv } from "../../../../config/env/worker";

export const accessVspoScheduleSiteWorkflow = () => {
  return {
    handler:
      () =>
      async (
        env: BindingAppWorkerEnv,
        _event: WorkflowEvent<Params>,
        step: WorkflowStep,
      ) => {
        const e = zBindingAppWorkerEnv.safeParse(env);
        if (!e.success) {
          console.error(e.error.message);
          return;
        }

        await step.do(
          "access-vspo-schedule-site",
          {
            retries: { limit: 1, delay: "5 second", backoff: "linear" },
            timeout: "5 minutes",
          },
          async () => {
            const response = await fetch(
              "https://www.vspo-schedule.com/ja/schedule/all",
            );
            if (!response.ok) {
              throw new Error("Failed to access VSPO schedule site");
            }
            const response2 = await fetch(
              "https://www.vspo-schedule.com/en/schedule/all",
            );
            if (!response2.ok) {
              throw new Error("Failed to access VSPO schedule site");
            }
          },
        );
      },
  };
};
