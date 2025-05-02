import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { AppLogger } from "@vspo-lab/logging";
import type { BindingAppWorkerEnv } from "../../config/env/worker";
import type { BindingWorkflowEnv } from "../../config/env/workflow";
import { setFeatureFlagProvider } from "../../config/featureFlag";
import { createHandler, withTracer } from "../../infra/http/trace";
import { searchChannelsWorkflow } from "../../infra/http/workflow/channel/search";
import { translateCreatorsWorkflow } from "../../infra/http/workflow/channel/trasnlate";
import { existClipsWorkflow } from "../../infra/http/workflow/clip/exist";
import { searchClipsWorkflow } from "../../infra/http/workflow/clip/search";
import { discordDeleteAllWorkflow } from "../../infra/http/workflow/discord/deleteAll";
import { discordSendMessagesWorkflow } from "../../infra/http/workflow/discord/send";
import {
  type DiscordSendMessageAllChannelParams,
  discordSendMessageAllChannelWorkflow,
} from "../../infra/http/workflow/discord/sendMessageAllChannel";
import {
  type DiscordSendMessageChannelsParams,
  discordSendMessageChannelsWorkflow,
} from "../../infra/http/workflow/discord/sendMessageChannels";
import { deleteStreamsWorkflow } from "../../infra/http/workflow/stream/delete";
import { searchStreamsWorkflow } from "../../infra/http/workflow/stream/search";
import { searchMemberStreamsByChannelWorkflow } from "../../infra/http/workflow/stream/searchMemberStreamByChannel";
import { translateStreamsWorkflow } from "../../infra/http/workflow/stream/trasnlate";
import { createUUID } from "../../pkg/uuid";

export class SearchChannelsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await searchChannelsWorkflow().handler()(this.env, _event, step);
  }
}

export class SearchStreamsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await searchStreamsWorkflow().handler()(this.env, _event, step);
  }
}

export class TranslateCreatorsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await translateCreatorsWorkflow().handler()(this.env, _event, step);
  }
}

export class TranslateStreamsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await translateStreamsWorkflow().handler()(this.env, _event, step);
  }
}

export class DiscordSendMessagesWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await discordSendMessagesWorkflow().handler()(this.env, _event, step);
  }
}

export class SearchMemberStreamsByChannelWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await searchMemberStreamsByChannelWorkflow().handler()(
      this.env,
      _event,
      step,
    );
  }
}

export class DeleteStreamsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await deleteStreamsWorkflow().handler()(this.env, _event, step);
  }
}

export class DiscordDeleteAllWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await discordDeleteAllWorkflow().handler()(this.env, _event, step);
  }
}

export class DiscordSendMessageAllChannelWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  DiscordSendMessageAllChannelParams
> {
  async run(
    event: WorkflowEvent<DiscordSendMessageAllChannelParams>,
    step: WorkflowStep,
  ) {
    await setFeatureFlagProvider(this.env);
    await discordSendMessageAllChannelWorkflow().handler()(
      this.env,
      event,
      step,
    );
  }
}

export class DiscordSendMessageChannelsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  DiscordSendMessageChannelsParams
> {
  async run(
    event: WorkflowEvent<DiscordSendMessageChannelsParams>,
    step: WorkflowStep,
  ) {
    await setFeatureFlagProvider(this.env);
    await discordSendMessageChannelsWorkflow().handler()(this.env, event, step);
  }
}

export class ExistClipsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await existClipsWorkflow().handler()(this.env, _event, step);
  }
}

export class SearchClipsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await searchClipsWorkflow().handler()(this.env, _event, step);
  }
}

export default createHandler({
  scheduled: async (
    controller: ScheduledController,
    env: BindingWorkflowEnv,
    ctx: ExecutionContext,
  ) => {
    return await withTracer("ScheduledHandler", "scheduled", async (span) => {
      span.setAttribute("cron", controller.cron);
      await setFeatureFlagProvider(env);
      switch (controller.cron) {
        case "0 0,7,18 * * *":
          AppLogger.info("search-channels");
          span.setAttribute("workflow", "search-channels");
          await env.SEARCH_CHANNELS_WORKFLOW.create({ id: createUUID() });
          break;
        case "5 0,7,18 * * *":
          AppLogger.info("translate-creators");
          span.setAttribute("workflow", "translate-creators");
          await env.TRANSLATE_CREATORS_WORKFLOW.create({ id: createUUID() });
          break;
        case "*/1 * * * *":
          AppLogger.info("search-streams");
          span.setAttribute("workflow", "search-streams");
          await env.SEARCH_STREAMS_WORKFLOW.create({ id: createUUID() });
          break;
        case "*/2 * * * *":
          AppLogger.info("discord-send-messages");
          span.setAttribute("workflow", "search-streams");
          await env.TRANSLATE_STREAMS_WORKFLOW.create({ id: createUUID() });
          await env.DISCORD_SEND_MESSAGES_WORKFLOW.create({ id: createUUID() });
          break;
        case "*/30 * * * *":
          AppLogger.info("search-member-streams-by-channel");
          span.setAttribute("workflow", "search-member-streams-by-channel");
          await env.SEARCH_MEMBER_STREAMS_BY_CHANNEL_WORKFLOW.create({
            id: createUUID(),
          });
          await env.DELETE_STREAMS_WORKFLOW.create({ id: createUUID() });
          break;
        case "15 * * * *":
          AppLogger.info("exist-clips");
          span.setAttribute("workflow", "clips-hourly");
          await env.EXIST_CLIPS_WORKFLOW.create({ id: createUUID() });
          await env.SEARCH_CLIPS_WORKFLOW.create({ id: createUUID() });
          break;
        default:
          console.error("Unknown cron", controller.cron);
          break;
      }
    });
  },
});
