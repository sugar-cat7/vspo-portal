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
    cacheName: 'vspo-proxy-cache',
    cacheControl: 'max-age=30',
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
