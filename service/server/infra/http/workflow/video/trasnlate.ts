import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { AppLogger } from "../../../../pkg/logging";
import { TargetLangSchema } from "../../../ai";

export const translateVideosWorkflow = () => {
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
        const lv = await step.do(
          "fetch default language videos",
          {
            retries: { limit: 3, delay: "5 second", backoff: "linear" },
            timeout: "1 minutes",
          },
          async () => {
            const vu = await env.APP_WORKER.newVideoUsecase();
            const result = await vu.list({
              limit: 100,
              page: 0,
              languageCode: "default",
            });

            if (result.err) {
              throw result.err;
            }

            return { val: result.val };
          },
        );

        if (lv.val.videos.length === 0) {
          logger.info("No videos to translate");
          return;
        }

        const results = await Promise.allSettled(
          TargetLangSchema.options.map((lang) =>
            step.do(
              `fetch and ${lang} translate videos`,
              {
                retries: { limit: 3, delay: "5 second", backoff: "linear" },
                timeout: "1 minutes",
              },
              async () => {
                const vu = await env.APP_WORKER.newVideoUsecase();
                await vu.translateVideoEnqueue({
                  languageCode: lang,
                  videos: lv.val.videos,
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
