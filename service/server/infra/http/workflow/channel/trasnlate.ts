import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { TargetLangSchema } from "../../../../domain/translate";
import { AppLogger } from "../../../../pkg/logging";

export const translateCreatorsWorkflow = () => {
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
        const logger = AppLogger.getInstance(e.data);
        const lv = await step.do(
          "fetch default language creators",
          {
            retries: { limit: 3, delay: "5 second", backoff: "linear" },
            timeout: "1 minutes",
          },
          async () => {
            const vu = await env.APP_WORKER.newCreatorUsecase();
            const result = await vu.list({
              limit: 30,
              page: 0,
              languageCode: "default",
              memberType: "vspo_jp",
            });

            if (result.err) {
              throw result.err;
            }

            const result2 = await vu.list({
              limit: 30,
              page: 0,
              languageCode: "default",
              memberType: "vspo_en",
            });

            if (result2.err) {
              throw result2.err;
            }

            return { val: result.val.creators.concat(result2.val.creators) };
          },
        );

        if (lv.val?.length === 0) {
          logger.info("No creators to translate");
          return;
        }

        const results = await Promise.allSettled(
          TargetLangSchema.options.map((lang) =>
            step.do(
              `fetch and ${lang} translate creators`,
              {
                retries: { limit: 3, delay: "5 second", backoff: "linear" },
                timeout: "1 minutes",
              },
              async () => {
                const vu = await env.APP_WORKER.newCreatorUsecase();
                await vu.translateCreatorEnqueue({
                  languageCode: lang,
                  creators: lv.val,
                });
              },
            ),
          ),
        );

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
