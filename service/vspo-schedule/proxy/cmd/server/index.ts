import { Env } from "@/pkg/env";
import { newApp } from "@/pkg/hono/app";
import { init } from "@/pkg/middleware";

const app = newApp();
app.notFound((c) => {
    return c.text('Not Found', 404)
})
app.use("*", init())

app.get('*', (c) => {
    // TODO: implement proxy
    return fetch(c.get('requestUrl'))
})


export default {
    fetch: async (req: Request, env: Env, executionCtx: ExecutionContext) => {
        return await app.fetch(req, env, executionCtx);
    },
    queue: async (
        batch: MessageBatch,
        env: Env,
        _executionContext: ExecutionContext,
    ) => {
        new Error('Not implemented');
    },
} satisfies ExportedHandler<Env>;
