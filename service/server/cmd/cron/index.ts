import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import type { BindingAppWorkerEnv } from "../../config/env/worker";
import type { BindingWorkflowEnv } from "../../config/env/workflow";
import { createHandler, withTracer } from "../../infra/http/otel";
import { searchChannelsWorkflow } from "../../infra/http/workflow/channel/search";
import { searchVideosWorkflow } from "../../infra/http/workflow/video/search";
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

export default createHandler({
  scheduled: async (
    controller: ScheduledController,
    env: BindingWorkflowEnv,
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
