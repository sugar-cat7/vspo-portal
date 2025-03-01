import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { TargetLangSchema } from "../../../../domain/translate";
import { AppLogger } from "../../../../pkg/logging";

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
          console.error(e.error.message);
          return;
        }
        const logger = AppLogger.getInstance(e.data);
        const lv = await step.do(
          "fetch default language videos",
          {
            retries: { limit: 3, delay: "5 second", backoff: "linear" },
            timeout: "1 minutes",
          },
          async () => {
            const vu = await env.APP_WORKER.newVideoUsecase();
            const liveVideos = await vu.list({
              limit: 10,
              page: 0,
              languageCode: "default",
              videoType: "vspo_stream",
              status: "live",
              orderBy: "desc",
            });

            if (liveVideos.err) {
              throw liveVideos.err;
            }

            const upcomingVideos = await vu.list({
              limit: 10,
              page: 0,
              languageCode: "default",
              videoType: "vspo_stream",
              status: "upcoming",
              orderBy: "desc",
            });

            if (upcomingVideos.err) {
              throw upcomingVideos.err;
            }

            const videos = liveVideos.val.videos.concat(
              upcomingVideos.val.videos,
            );
            return { val: videos };
          },
        );

        if (lv.val?.length === 0) {
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
                  videos: lv.val,
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
