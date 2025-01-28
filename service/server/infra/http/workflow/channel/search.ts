import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import type { AppEnv } from "../../../../config/env";

export const searchChannelsWorkflow = () => {
  return {
    handler:
      () =>
      async (
        env: AppEnv,
        _event: WorkflowEvent<Params>,
        step: WorkflowStep,
      ) => {
        const results = await Promise.allSettled([
          step.do(
            "fetch and send vspo_jp channels",
            {
              retries: { limit: 3, delay: "5 second", backoff: "linear" },
              timeout: "1 minutes",
            },
            async () => {
              const vu = await env.APP_WORKER.newCreatorUsecase();
              const result = await vu.searchByMemberType({
                memberType: "vspo_jp",
              });
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
            "fetch and send vspo_en channels",
            {
              retries: { limit: 3, delay: "5 second", backoff: "linear" },
              timeout: "1 minutes",
            },
            async () => {
              const vu = await env.APP_WORKER.newCreatorUsecase();
              const result = await vu.searchByMemberType({
                memberType: "vspo_en",
              });
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
          throw new Error(
            `${failedSteps.length} step(s) failed. Check logs for details.`,
          );
        }
      },
  };
};
