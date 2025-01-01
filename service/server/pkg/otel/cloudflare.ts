import { type ResolveConfigFn, instrument } from '@microlabs/otel-cf-workers'
import { trace } from '@opentelemetry/api'
import type { Env } from '../env'
import type { App } from '../hono'

const config: ResolveConfigFn = (env: Env, _trigger) => {
  return {
    exporter: {
      url: env.OTEL_EXPORTER_URL,
      headers: { 'x-api-key': env.BASELIME_API_KEY },
    },
    service: { name: env.SERVICE_NAME },
  }
}

export const createHandler = (app: App) => {
  const handler = {
    fetch: async (req: Request, env: Env, executionCtx: ExecutionContext) => {
      const tracer = trace.getTracer('OTelCFWorkers:Fetcher')
      return await tracer.startActiveSpan('Exec', async (span) => {
        try {
          const response = await app.fetch(req, env, executionCtx)
          return response
        } catch (error: unknown) {
          if (error instanceof Error) {
            span.recordException(error)
          } else {
            span.recordException(new Error(String(error)))
          }
          throw error
        } finally {
          span.end()
        }
      })
    },

    queue: async (batch: MessageBatch, env: Env, _executionContext: ExecutionContext) => {
      const tracer = trace.getTracer('OTelCFWorkers:Consumer')
      await tracer.startActiveSpan('Consume', async (span) => {
        try {
          span.addEvent('Consume', { queue: batch.queue })
          switch (batch.queue) {
            case 'log-info':
              console.log('log queue', batch.messages)
              await env.APP_BUCKET.put(`logs/${Date.now()}.log`, JSON.stringify(batch.messages))
              break
            case 'app-queue':
              console.info('app queue', batch.messages)
              break
            default:
              console.error('Unknown queue', batch)
              break
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            span.recordException(error)
          } else {
            span.recordException(new Error(String(error)))
          }
          throw error
        } finally {
          span.end()
        }
      })
    },
  } satisfies ExportedHandler<Env>

  return instrument(handler, config)
}
