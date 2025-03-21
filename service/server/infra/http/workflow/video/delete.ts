import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { AppLogger } from "../../../../pkg/logging";
import { withTracer } from "../../../http/trace/cloudflare";

export const deleteVideosWorkflow = () => {
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
        const results = await Promise.allSettled([
          step.do(
            "fetch and delete deleted videos",
            {
              retries: { limit: 1, delay: "5 second", backoff: "linear" },
              timeout: "1 minutes",
            },
            async () => {
              return withTracer(
                "video-workflow",
                "delete-deleted-videos",
                async (span) => {
                  const vu = await env.APP_WORKER.newVideoUsecase();
                  const result = await vu.deletedListIds();
                  if (result.err) {
                    throw result.err;
                  }
                  AppLogger.info("after deletedListIds", {
                    videoIds: result.val,
                  });
                  if (result.val.length === 0) {
                    span.setAttribute("videos_count", 0);
                    return;
                  }
                  AppLogger.info("batchDeleteByVideoIds", {
                    videoIds: result.val,
                  });
                  span.setAttribute("videos_count", result.val.length);
                  const _ = await vu.batchDeleteByVideoIds({
                    videoIds: result.val,
                  });
                },
              );
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
