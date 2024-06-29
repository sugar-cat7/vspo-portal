import { v4 as uuidv4 } from 'uuid'
import { MiddlewareHandler } from "hono";
import { AppContext, HonoEnv } from "@/pkg/hono";
import { env } from 'hono/adapter'
import { type Env, zEnv } from '@/pkg/env'
import { AppLogger } from "@/pkg/logging";
import { trace } from '@opentelemetry/api';

export function init(): MiddlewareHandler<HonoEnv> {
    return async (c, next) => {
        const apiKey = c.req.header('x-api-key')
        if (!apiKey) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const honoEnv = env<Env, AppContext>(c)
        const envResult = zEnv.safeParse(honoEnv)
        if (!envResult.success) {
            console.error('Failed to parse environment variables', envResult.error)
            process.exit(1)
            return
        }
        const requestId = uuidv4();
        c.set("requestId", requestId);
        const logger = new AppLogger({
            env: envResult.data,
            requestId: requestId,
        });
        c.set("services", {
            logger: logger,
            tracer: trace.getTracer('OTelCFWorkers:Fetcher'),
            kv: envResult.data.APP_KV,
        });
        const url = new URL(c.req.url);
        const requestUrl = `${envResult.data.API_BASE_URL}${url.pathname}${url.search}`;
        c.set("requestUrl", requestUrl);
        c.set("translateUrl", envResult.data.TRANSLATE_URL);
        c.set("apiKey", apiKey);
        logger.info(`[Request started]: ${requestUrl}`);
        await next();
    };
}
