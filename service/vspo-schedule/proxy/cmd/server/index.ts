import { Env } from "@/pkg/env";
import { newApp } from "@/pkg/hono/app";
import { init } from "@/pkg/middleware";
import { registerOldAPIProxyRoutes } from "@/routes";
import { cache } from 'hono/cache'

const app = newApp();
app.notFound((c) => {
    return c.text('Not Found', 404)
})
app.use("*", init(), cache({
    cacheName: 'vspo-schedule',
    cacheControl: 'max-age=60',
    keyGenerator: (c) => {
        const url = new URL(c.req.url)
        return `${url.pathname}${url.search}`
    }
}))

registerOldAPIProxyRoutes(app)


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
