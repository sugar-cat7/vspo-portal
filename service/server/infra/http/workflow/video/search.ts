import { WorkflowEvent, WorkflowStep } from "cloudflare:workers"
import { AppEnv } from "../../../../config/env";

export const searchVideosWorkflow = () => {
    return {
        handler: () => async (env:AppEnv,_event: WorkflowEvent<Params>, step: WorkflowStep) => {
            const results = await Promise.allSettled([
                step.do("fetch and send live videos", { retries: { limit: 3, delay: '5 second', backoff: 'linear' }, timeout: '1 minutes' },
                    async () => {
                        const vu = await env.APP_WORKER.newVideoUsecase();
                        const result = await vu.searchLive({});
                        if (result.err) {
                            throw result.err;
                        }
                        if (result.val.length === 0) {
                            return;
                        }
                       const _ =  await vu.batchUpsertEnqueue(result.val);
                    }),
                step.do("fetch and send existing videos", { retries: { limit: 3, delay: '5 second', backoff: 'linear' }, timeout: '1 minutes' },
                    async () => {
                        const vu = await env.APP_WORKER.newVideoUsecase();
                        const result = await vu.searchExist({});
                        if (result.err) {
                            throw result.err;
                        }
                        if (result.val.length === 0) {
                            return;
                        }
                        const _ =  await vu.batchUpsertEnqueue(result.val);
                    })
            ]);
    
            const failedSteps = results.filter(result => result.status === "rejected");
            if (failedSteps.length > 0) {
                throw new Error(`${failedSteps.length} step(s) failed. Check logs for details.`);
            }
        }
    }
}