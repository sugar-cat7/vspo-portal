import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import type { BindingAppWorkerEnv } from "../../config/env/worker";
import type { BindingWorkflowEnv } from "../../config/env/workflow";
import { createHandler, withTracer } from "../../infra/http/otel";
import { searchChannelsWorkflow } from "../../infra/http/workflow/channel/search";
import { translateCreatorsWorkflow } from "../../infra/http/workflow/channel/trasnlate";
import { discordSendMessagesWorkflow } from "../../infra/http/workflow/discord/send";
import { searchVideosWorkflow } from "../../infra/http/workflow/video/search";
import { translateVideosWorkflow } from "../../infra/http/workflow/video/trasnlate";
import { createUUID } from "../../pkg/uuid";

export class SearchChannelsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await searchChannelsWorkflow().handler()(this.env, _event, step);
  }
}

export class SearchVideosWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await searchVideosWorkflow().handler()(this.env, _event, step);
  }
}

export class TranslateCreatorsWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await translateCreatorsWorkflow().handler()(this.env, _event, step);
  }
}

export class TranslateVideosWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await translateVideosWorkflow().handler()(this.env, _event, step);
  }
}

export class DiscordSendMessagesWorkflow extends WorkflowEntrypoint<
  BindingAppWorkerEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await discordSendMessagesWorkflow().handler()(this.env, _event, step);
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
      switch (controller.cron) {
        // FIXME: Temporarily
        case "0 0,8,16 * * *":
          await env.SEARCH_VIDEOS_WORKFLOW.create({ id: createUUID() });
          break;
        case "0 0,7,18 * * *":
          await env.SEARCH_CHANNELS_WORKFLOW.create({ id: createUUID() });
          await env.TRANSLATE_CREATORS_WORKFLOW.create({ id: createUUID() });
          break;
        case "0 0,9,17 * * *":
          await env.TRANSLATE_VIDEOS_WORKFLOW.create({ id: createUUID() });
          break;

        case "*/2 * * * *":
          // await env.SEARCH_VIDEOS_WORKFLOW.create({ id: createUUID() });
          await env.DISCORD_SEND_MESSAGES_WORKFLOW.create({ id: createUUID() });
          break;
        // case "1 * * * *":
        //   await env.SEARCH_CHANNELS_WORKFLOW.create({ id: createUUID() });
        //   await env.TRANSLATE_CREATORS_WORKFLOW.create({ id: createUUID() });
        //   break;
        // case "*/3 * * * *":
        //   await env.TRANSLATE_VIDEOS_WORKFLOW.create({ id: createUUID() });
        //   break;
        default:
          console.error("Unknown cron", controller.cron);
          break;
      }
    });
  },
});
