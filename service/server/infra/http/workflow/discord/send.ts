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
            const lang = server.languageCode;
            if (!acc[lang]) {
              acc[lang] = {
                channelLangaugeCode: lang,
                channelIds: [],
              };
            }
            acc[lang].channelIds.push(
              ...server.discordChannels.map((c) => c.rawId),
            );
            return acc;
          },
          {},
        );

        const discordChannelMap: DiscordChannelIdsMap =
          Object.values(groupedChannels);

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
                await vu.sendVideosToMultipleChannels({
                  channelIds: group.channelIds,
                  channelLangaugeCode: group.channelLangaugeCode,
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
