import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import type { DiscordServers } from "../../../../domain";
import { AppLogger } from "../../../../pkg/logging";

type DiscordChannelIdsMap = {
  channelIds: string[];
  channelLangaugeCode: string;
}[];

type GroupedChannels = {
  [language: string]: {
    channelLangaugeCode: string;
    channelIds: string[];
  };
};

export const discordSendMessagesWorkflow = () => {
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
          "fetch DiscordServers",
          {
            retries: { limit: 3, delay: "3 second", backoff: "linear" },
            timeout: "1 minutes",
          },
          async () => {
            const du = await env.APP_WORKER.newDiscordUsecase();
            const allDiscordServers: DiscordServers = [];
            let currentPage = 0;
            let hasNext = true;

            while (hasNext) {
              const result = await du.list({
                limit: 100,
                page: currentPage,
              });

              if (result.err) {
                throw result.err;
              }

              allDiscordServers.push(...result.val.discordServers);
              currentPage++;
              hasNext = result.val.pagination.hasNext;
            }

            return { allDiscordServers };
          },
        );

        if (lv.allDiscordServers.length === 0) {
          logger.info("No videos to translate");
          return;
        }

        // ramdomly shuffle allDiscordServers
        const shuffledDiscordServers = lv.allDiscordServers.sort(
          () => Math.random() - 0.5,
        );

        const groupedChannels = shuffledDiscordServers.reduce<GroupedChannels>(
          (acc, server) => {
            // Process each channel of the server individually
            for (const channel of server.discordChannels) {
              // Prioritize the channel-specific language setting; use the server's language setting if none exists
              const channelLang = channel.languageCode || server.languageCode;

              if (!acc[channelLang]) {
                acc[channelLang] = {
                  channelLangaugeCode: channelLang,
                  channelIds: [],
                };
              }

              // Ensure the channel ID has not already been added (to prevent duplicates)
              if (!acc[channelLang].channelIds.includes(channel.rawId)) {
                acc[channelLang].channelIds.push(channel.rawId);
              }
            }

            return acc;
          },
          {},
        );

        const discordChannelMap: DiscordChannelIdsMap =
          Object.values(groupedChannels);

        logger.info("Grouped channels by language", {
          totalLanguages: discordChannelMap.length,
          languageGroups: discordChannelMap.map((group) => ({
            language: group.channelLangaugeCode,
            channelCount: group.channelIds.length,
            channelIds: group.channelIds,
          })),
        });

        const results = await Promise.allSettled(
          discordChannelMap.map((group) =>
            step.do(
              `send videos to channels for ${group.channelLangaugeCode}`,
              {
                retries: { limit: 3, delay: "5 second", backoff: "linear" },
                timeout: "1 minutes",
              },
              async () => {
                const vu = await env.APP_WORKER.newDiscordUsecase();
                logger.info(
                  `Sending videos to ${group.channelIds.length} channels with language: ${group.channelLangaugeCode}`,
                  {
                    channelCount: group.channelIds.length,
                    language: group.channelLangaugeCode,
                  },
                );
                await vu.sendVideosToMultipleChannels({
                  channelIds: group.channelIds,
                  channelLangaugeCode: group.channelLangaugeCode,
                });
                logger.info(
                  `Successfully sent videos to channels with language: ${group.channelLangaugeCode}`,
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
