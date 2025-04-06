import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import type { BindingAppWorkerEnv } from "../../config/env/worker";
import type { BindingWorkflowEnv } from "../../config/env/workflow";
import { setFeatureFlagProvider } from "../../config/featureFlag";
import { createHandler, withTracer } from "../../infra/http/trace";
import { searchChannelsWorkflow } from "../../infra/http/workflow/channel/search";
import { translateCreatorsWorkflow } from "../../infra/http/workflow/channel/trasnlate";
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
import { deleteVideosWorkflow } from "../../infra/http/workflow/video/delete";
import { searchVideosWorkflow } from "../../infra/http/workflow/video/search";
import { searchMemberVideosByChannelWorkflow } from "../../infra/http/workflow/video/searchMemberVideoByChannel";
import { translateVideosWorkflow } from "../../infra/http/workflow/video/trasnlate";
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

export class SearchVideosWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await searchVideosWorkflow().handler()(this.env, _event, step);
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

export class TranslateVideosWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await translateVideosWorkflow().handler()(this.env, _event, step);
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

export class SearchMemberVideosByChannelWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await searchMemberVideosByChannelWorkflow().handler()(
      this.env,
      _event,
      step,
    );
  }
}

export class DeleteVideosWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await setFeatureFlagProvider(this.env);
    await deleteVideosWorkflow().handler()(this.env, _event, step);
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
          span.setAttribute("workflow", "search-channels");
          await env.SEARCH_CHANNELS_WORKFLOW.create({ id: createUUID() });
          break;
        case "5 0,7,18 * * *":
          span.setAttribute("workflow", "translate-creators");
          await env.TRANSLATE_CREATORS_WORKFLOW.create({ id: createUUID() });
          break;
        case "*/2 * * * *":
          span.setAttribute("workflow", "search-videos");
          await env.SEARCH_VIDEOS_WORKFLOW.create({ id: createUUID() });
          await env.TRANSLATE_VIDEOS_WORKFLOW.create({ id: createUUID() });
          await env.DISCORD_SEND_MESSAGES_WORKFLOW.create({ id: createUUID() });
          break;
        case "*/30 * * * *":
          span.setAttribute("workflow", "search-member-videos-by-channel");
          await env.SEARCH_MEMBER_VIDEOS_BY_CHANNEL_WORKFLOW.create({
            id: createUUID(),
          });
          await env.DELETE_VIDEOS_WORKFLOW.create({ id: createUUID() });
          break;
        default:
          console.error("Unknown cron", controller.cron);
          break;
      }
    });
  },
});
