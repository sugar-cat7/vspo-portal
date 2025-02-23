import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { TargetLangSchema } from "../../../../domain/translate";
import { AppLogger } from "../../../../pkg/logging";
import { withTracer } from "../../trace/cloudflare";

export const translateCreatorsWorkflow = () => {
  return {
    handler:
      () =>
      async (
        env: BindingAppWorkerEnv,
        _event: WorkflowEvent<Params>,
        step: WorkflowStep,
      ) => {
        return withTracer("workflow", "translate-creators", async (span) => {
          const e = zBindingAppWorkerEnv.safeParse(env);
          if (!e.success) {
            console.error(e.error.message);
            return;
          }
          const logger = AppLogger.getInstance(e.data);
          const lv = await withTracer(
            "workflow-step",
            "fetch-default-language-creators",
            async (stepSpan) => {
              return step.do(
                "fetch default language creators",
                {
                  retries: { limit: 3, delay: "5 second", backoff: "linear" },
                  timeout: "1 minutes",
                },
                async () => {
                  const vu = await env.APP_WORKER.newCreatorUsecase();
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
            },
          );

          if (lv.val.creators.length === 0) {
            logger.info("No creators to translate");
            return;
          }

          const results = await Promise.allSettled(
            TargetLangSchema.options.map((lang) =>
              withTracer(
                "workflow-step",
                `translate-creators-${lang}`,
                async (stepSpan) => {
                  return step.do(
                    `fetch and ${lang} translate creators`,
                    {
                      retries: {
                        limit: 3,
                        delay: "5 second",
                        backoff: "linear",
                      },
                      timeout: "1 minutes",
                    },
                    async () => {
                      const vu = await env.APP_WORKER.newCreatorUsecase();
                      await vu.translateCreatorEnqueue({
                        languageCode: lang,
                        creators: lv.val.creators,
                      });
                    },
                  );
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
        });
      },
  };
};
