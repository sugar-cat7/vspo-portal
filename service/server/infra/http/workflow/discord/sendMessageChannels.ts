import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import { AppLogger } from "../../../../pkg/logging";

export type DiscordSendMessageChannelsParams = {
  channelIds: string[];
  content: string;
};

export const discordSendMessageChannelsWorkflow = () => {
  return {
    handler:
      () =>
      async (
        env: BindingAppWorkerEnv,
        event: WorkflowEvent<DiscordSendMessageChannelsParams>,
        step: WorkflowStep,
      ) => {
        const e = zBindingAppWorkerEnv.safeParse(env);
        if (!e.success) {
          console.error(e.error.message);
          return;
        }
        const logger = AppLogger.getInstance(e.data);

        const results = await Promise.allSettled(
          event.payload.channelIds.map((channelId) =>
            step.do(
              `send message to channel ${channelId}`,
              {
                retries: { limit: 3, delay: "5 second", backoff: "linear" },
                timeout: "1 minutes",
              },
              async () => {
                const vu = await env.APP_WORKER.newDiscordUsecase();
                logger.info(`Sending message to channel ${channelId}`, {
                  channelId,
                });
                // Send message to the specified channel
                await vu.sendAdminMessage({
                  channelId,
                  content: event.payload.content,
                });
                logger.info(
                  `Successfully sent message to channel ${channelId}`,
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
      },
  };
};
