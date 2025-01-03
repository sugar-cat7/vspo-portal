// import { trace } from '@opentelemetry/api'
import type { Env } from 'hono'
import { env } from 'hono/adapter'
import { zEnv } from '../../../../pkg/env'
import type { AppContext, HonoEnv } from '../../../../pkg/hono'
import { AppLogger } from '../../../../pkg/logging'
import { createMiddleware } from 'hono/factory'
import { Dependency } from '../../../dependency'

export const init = createMiddleware<HonoEnv>(async (c, next) => {
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
  c.set('requestId', requestId)
  c.set('services', {
    logger: logger,
    di: new Dependency(envResult.data),
    // tracer: trace.getTracer('OTelCFWorkers:Fetcher'),
  })
  logger.info('[Request started]')
  await next()
})
