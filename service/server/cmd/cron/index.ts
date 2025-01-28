import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import type { AppEnv } from "../../config/env";
import { createHandler, withTracer } from "../../infra/http/otel";
import { searchChannelsWorkflow } from "../../infra/http/workflow/channel/search";
import { searchVideosWorkflow } from "../../infra/http/workflow/video/search";
import { createUUID } from "../../pkg/uuid";

export class SearchChannelsWorkflow extends WorkflowEntrypoint<AppEnv, Params> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await searchChannelsWorkflow().handler()(this.env, _event, step);
  }
}

export class SearchVideosWorkflow extends WorkflowEntrypoint<AppEnv, Params> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    await searchVideosWorkflow().handler()(this.env, _event, step);
  }
}

export default createHandler({
  scheduled: async (
    controller: ScheduledController,
    env: AppEnv,
    ctx: ExecutionContext,
  ) => {
    return await withTracer(
      "OTelCFWorkers:Consumer",
      "Consume",
      async (span) => {
        switch (controller.cron) {
          case "0 0 * * *":
            // await env.SEARCH_VIDEOS_WORKFLOW.create({id: createUUID()})
            await env.SEARCH_CHANNELS_WORKFLOW.create({ id: createUUID() });
            break;
          default:
            console.error("Unknown cron", controller);
            break;
        }
      },
    );
  },
});
