import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { OpenFeature } from "@openfeature/server-sdk";
import {
  type BindingAppWorkerEnv,
  zBindingAppWorkerEnv,
} from "../../../../config/env/worker";
import type { DiscordServers } from "../../../../domain";
import { AppLogger } from "../../../../pkg/logging";
import { withTracer } from "../../../http/trace/cloudflare";

type DiscordChannelIdsMap = {
  channelIds: string[];
  channelLangaugeCode: string;
  channelMemberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "vspo_all" | "general";
}[];

type GroupedChannels = {
  [key: string]: {
    channelLangaugeCode: string;
    channelMemberType:
      | "vspo_jp"
      | "vspo_en"
      | "vspo_ch"
      | "vspo_all"
      | "general";
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
        const client = OpenFeature.getClient();
        const enabled = await client.getBooleanValue(
          "discord-bot-maintenance",
          false,
        );
        if (enabled) {
          logger.info("Bot is under maintenance");
          return;
        }
        const lv = await step.do(
          "fetch DiscordServers",
          {
            retries: { limit: 3, delay: "3 second", backoff: "linear" },
            timeout: "1 minutes",
          },
          async () => {
            return withTracer(
              "discord-workflow",
              "fetch-discord-servers",
              async (span) => {
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

                span.setAttribute("servers_count", allDiscordServers.length);
                return { allDiscordServers };
              },
            );
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
              const memberType = channel.memberType || "vspo_all";
              const compositeKey = `${channelLang}-${memberType}`;

              if (!acc[compositeKey]) {
                acc[compositeKey] = {
                  channelLangaugeCode: channelLang,
                  channelMemberType: memberType,
                  channelIds: [],
                };
              }

              // Ensure the channel ID has not already been added (to prevent duplicates)
              if (!acc[compositeKey].channelIds.includes(channel.rawId)) {
                acc[compositeKey].channelIds.push(channel.rawId);
              }
            }

            return acc;
          },
          {},
        );

        const discordChannelMap: DiscordChannelIdsMap =
          Object.values(groupedChannels);

        logger.info("Grouped channels by language and member type", {
          totalGroups: discordChannelMap.length,
          groups: discordChannelMap.map((group) => ({
            language: group.channelLangaugeCode,
            memberType: group.channelMemberType,
            channelCount: group.channelIds.length,
            channelIds: group.channelIds,
          })),
        });

        // Function to split channels into batches of 50
        const splitIntoBatches = (channelIds: string[], batchSize = 50) => {
          const batches: string[][] = [];
          for (let i = 0; i < channelIds.length; i += batchSize) {
            batches.push(channelIds.slice(i, i + batchSize));
          }
          return batches;
        };

        // Process each language group
        for (const group of discordChannelMap) {
          const batches = splitIntoBatches(group.channelIds);
          logger.info(
            `Split ${group.channelIds.length} channels into ${batches.length} batches for language: ${group.channelLangaugeCode}`,
          );

          // First attempt - process each batch with 1-second delay between batches
          for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            await step.do(
              `send videos to channels for ${group.channelLangaugeCode} (batch ${i + 1}/${batches.length})`,
              {
                retries: { limit: 3, delay: "5 second", backoff: "linear" },
                timeout: "1 minutes",
              },
              async () => {
                return withTracer(
                  "discord-workflow",
                  `send-videos-language-${group.channelLangaugeCode}-batch-${i + 1}`,
                  async (span) => {
                    const vu = await env.APP_WORKER.newDiscordUsecase();
                    logger.info(
                      `Sending videos to ${batch.length} channels with language: ${group.channelLangaugeCode} (batch ${i + 1}/${batches.length})`,
                      {
                        channelCount: batch.length,
                        language: group.channelLangaugeCode,
                        batchNumber: i + 1,
                        totalBatches: batches.length,
                      },
                    );
                    span.setAttribute("language", group.channelLangaugeCode);
                    span.setAttribute("channels_count", batch.length);
                    span.setAttribute("batch_number", i + 1);
                    span.setAttribute("total_batches", batches.length);

                    await vu.sendVideosToMultipleChannels({
                      channelIds: batch,
                      channelLangaugeCode: group.channelLangaugeCode,
                      channelMemberType: group.channelMemberType,
                    });

                    logger.info(
                      `Successfully sent videos to channels with language: ${group.channelLangaugeCode} (batch ${i + 1}/${batches.length})`,
                    );
                  },
                );
              },
            );

            // Add 1-second sleep between batches (except after the last batch)
            if (i < batches.length - 1) {
              await step.sleep("1 second", "1 second");
            }
          }
        }

        // Wait 30 seconds before the second attempt
        await step.sleep("30 seconds", "30 seconds");

        // Second attempt - process each batch with 1-second delay between batches
        for (const group of discordChannelMap) {
          const batches = splitIntoBatches(group.channelIds);

          for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            await step.do(
              `send videos to channels for ${group.channelLangaugeCode} 2 (batch ${i + 1}/${batches.length})`,
              {
                retries: { limit: 3, delay: "5 second", backoff: "linear" },
                timeout: "1 minutes",
              },
              async () => {
                return withTracer(
                  "discord-workflow",
                  `send-videos-language-${group.channelLangaugeCode}-2-batch-${i + 1}`,
                  async (span) => {
                    const vu = await env.APP_WORKER.newDiscordUsecase();
                    logger.info(
                      `Sending videos to ${batch.length} channels with language: ${group.channelLangaugeCode} (batch ${i + 1}/${batches.length})`,
                      {
                        channelCount: batch.length,
                        language: group.channelLangaugeCode,
                        batchNumber: i + 1,
                        totalBatches: batches.length,
                      },
                    );
                    span.setAttribute("language", group.channelLangaugeCode);
                    span.setAttribute("channels_count", batch.length);
                    span.setAttribute("batch_number", i + 1);
                    span.setAttribute("total_batches", batches.length);

                    await vu.sendVideosToMultipleChannels({
                      channelIds: batch,
                      channelLangaugeCode: group.channelLangaugeCode,
                      channelMemberType: group.channelMemberType,
                    });

                    logger.info(
                      `Successfully sent videos to channels with language: ${group.channelLangaugeCode} (batch ${i + 1}/${batches.length})`,
                    );
                  },
                );
              },
            );

            // Add 1-second sleep between batches (except after the last batch)
            if (i < batches.length - 1) {
              await step.sleep("1 second", "1 second");
            }
          }
        }
      },
  };
};
