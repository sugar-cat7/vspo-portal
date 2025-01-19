import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { Env } from "../../config/env";
import type { ApplicationService } from "../server/internal/app";
import { convertToUTCDate } from "../../pkg/dayjs";

type WorkflowEnv = Env & {
	APPLICATION_SERVICE: Service<ApplicationService>;
}

export class UpdateVideoWorkflow extends WorkflowEntrypoint<WorkflowEnv, Params> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
        const videos = await step.do("fetch videos", 
			{
			retries: {
				limit: 3,
				delay: '5 second',
				backoff: 'linear',
				},
				timeout: '1 minutes',
			},
			async () => {
			// https://developers.cloudflare.com/workers/runtime-apis/rpc/#promise-pipelining
			using vu = await this.env.APPLICATION_SERVICE.newVideoUsecase()
			const r1 = await vu.searchLive({})
			const r2 = await vu.searchExist({})

			if (r1.err) {
				throw r1.err
			}

			if (r2.err) {
				throw r2.err
			}
			const v = await Promise.all(r1.val.concat(r2.val).map(async v => ({
				...v,
				publishedAt: await v.publishedAt.toISOString(),
				startedAt: await v.startedAt?.toISOString(),
				endedAt: await v.endedAt?.toISOString(),
			})))
			return v
        })

		const r = await step.do("write videos", 
			{
				retries: {
					limit: 3,
					delay: '5 second',
					backoff: 'linear',
					},
					timeout: '1 minutes',
				},
			async () => {
			using uv = await this.env.APPLICATION_SERVICE.newVideoUsecase()
			const r = await uv.batchUpsert(videos.map(v => ({
				...v,
				publishedAt: convertToUTCDate(v.publishedAt),
				startedAt: v.startedAt ? convertToUTCDate(v.startedAt) : null,
				endedAt: v.endedAt ? convertToUTCDate(v.endedAt) : null,
			})))

			if (r.err) {
				throw r.err
			}
		})
    }
}