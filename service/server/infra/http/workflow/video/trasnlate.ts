import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { TargetLangSchema } from "../../../../domain/translate";
import { AppLogger } from "../../../../pkg/logging";
import { withTracer } from "../../../http/trace/cloudflare";

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
            return withTracer(
              "video-workflow",
              "fetch-default-language-videos",
              async (span) => {
                const vu = await env.APP_WORKER.newVideoUsecase();
                const liveVideos = await vu.list({
                  limit: 100,
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
                  limit: 100,
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
                span.setAttribute(
                  "live_videos_count",
                  liveVideos.val.videos.length,
                );
                span.setAttribute(
                  "upcoming_videos_count",
                  upcomingVideos.val.videos.length,
                );
                span.setAttribute("total_videos_count", videos.length);
                return { val: videos };
              },
            );
          },
        );

        if (lv.val?.length === 0) {
          logger.info("No videos to translate");
          return;
        }
        const target = TargetLangSchema.options.map(async (lang) => {
          const vu = await env.APP_WORKER.newVideoUsecase();
          const liveVideos = await vu.list({
            limit: 100,
            page: 0,
            languageCode: lang,
            videoType: "vspo_stream",
            status: "live",
            orderBy: "desc",
          });

          if (liveVideos.err) {
            throw liveVideos.err;
          }

          const upcomingVideos = await vu.list({
            limit: 100,
            page: 0,
            languageCode: lang,
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

          const notTranslatedVideos = lv.val.filter(
            (v) => !videos.some((v2) => v2.rawId === v.rawId),
          );

          return step.do(
            `fetch and ${lang} translate videos`,
            {
              retries: { limit: 3, delay: "5 second", backoff: "linear" },
              timeout: "1 minutes",
            },
            async () => {
              return withTracer(
                "video-workflow",
                `translate-videos-to-${lang}`,
                async (span) => {
                  const vu = await env.APP_WORKER.newVideoUsecase();
                  span.setAttribute("language", lang);
                  span.setAttribute("videos_count", notTranslatedVideos.length);
                  await vu.translateVideoEnqueue({
                    languageCode: lang,
                    videos: notTranslatedVideos,
                  });
                },
              );
            },
          );
        });
        const results = await Promise.allSettled(target);

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
