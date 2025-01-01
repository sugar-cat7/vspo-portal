import { trace } from '@opentelemetry/api'
import type { Env, MiddlewareHandler } from 'hono'
import { env } from 'hono/adapter'
import { createDB } from '../db/sqlite/provider'
import { zEnv } from '../env'
import type { AppContext, HonoEnv } from '../hono'
import { AppLogger } from '../logging'
import { createOpenAIProvider } from '../openai'

export function init(): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    const honoEnv = env<Env, AppContext>(c)
    const envResult = zEnv.safeParse(honoEnv)
    if (!envResult.success) {
      console.error('Failed to parse environment variables', envResult.error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
    const requestId = c.get('requestId')
    const logger = new AppLogger({
      env: envResult.data,
      requestId: requestId,
    })
    const db = createDB({
      binding: envResult.data.APP_DB,
    })
    const openai = createOpenAIProvider({
      apiKey: envResult.data.OPENAI_API_KEY,
      organization: envResult.data.OPENAI_ORGANIZATION,
      project: envResult.data.OPENAI_PROJECT,
      baseURL: envResult.data.OPENAI_BASE_URL,
    })
    c.set('requestId', requestId)
    c.set('services', {
      logger: logger,
      db: db,
      tracer: trace.getTracer('OTelCFWorkers:Fetcher'),
      openai: openai,
    })
    logger.info('[Request started]')
    await next()
  }
}
