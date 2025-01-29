import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { AppLogger } from "../../../../pkg/logging";

export const searchVideosWorkflow = () => {
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
          throw new Error(e.error.message);
        }
        const logger = new AppLogger({ env: e.data });
        const results = await Promise.allSettled([
          step.do(
            "fetch and send live videos",
            {
              retries: { limit: 3, delay: "5 second", backoff: "linear" },
              timeout: "1 minutes",
            },
            async () => {
              const vu = await env.APP_WORKER.newVideoUsecase();
              const result = await vu.searchLive();
              if (result.err) {
                throw result.err;
              }
              if (result.val.length === 0) {
                return;
              }
              const _ = await vu.batchUpsertEnqueue(result.val);
            },
          ),
          step.do(
            "fetch and send existing videos",
            {
              retries: { limit: 3, delay: "5 second", backoff: "linear" },
              timeout: "1 minutes",
            },
            async () => {
              const vu = await env.APP_WORKER.newVideoUsecase();
              const result = await vu.searchExist();
              if (result.err) {
                throw result.err;
              }
              if (result.val.length === 0) {
                return;
              }
              const _ = await vu.batchUpsertEnqueue(result.val);
            },
          ),
        ]);

        const failedSteps = results.filter(
          (result) => result.status === "rejected",
        );
        if (failedSteps.length > 0) {
          logger.error(
            `${failedSteps.length} step(s) failed. Check logs for details.`,
          );
        }
      },
  };
};
