import { type ResolveConfigFn, instrument } from '@microlabs/otel-cf-workers'
import { trace, Span } from '@opentelemetry/api'
import { AppEnv } from '../../../config/env'


export const withTracer = async <T>(
  tracerName: string,
  spanName: string,
  callback: (span: Span) => Promise<T>,
): Promise<T> => {
  const tracer = trace.getTracer(tracerName)
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      return await callback(span)
    } catch (error) {
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
}

const config: ResolveConfigFn = (env: AppEnv, _trigger) => {
  return {
    exporter: {
      url: env.OTEL_EXPORTER_URL,
      headers: { 'x-api-key': env.BASELIME_API_KEY },
    },
    service: { name: env.SERVICE_NAME },
  }
}

type Handler<T = unknown> = {
  fetch?: (req: Request, env: AppEnv, _executionContext: ExecutionContext) => Promise<Response>,
  queue?: (batch: MessageBatch<T>, env: AppEnv, _executionContext: ExecutionContext) => Promise<void>,
  scheduled?: (controller: ScheduledController, env: AppEnv, ctx: ExecutionContext) => Promise<void>,
}

export const createHandler = <T>(handler: Handler<T>) => {
  return instrument(handler, config)
}