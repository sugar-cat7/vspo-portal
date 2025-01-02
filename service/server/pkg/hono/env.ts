import type { OpenAIProvider } from '@ai-sdk/openai'
import type { Tracer } from '@opentelemetry/api'
import type { RequestIdVariables } from 'hono/request-id'
import type { Env } from '../env'
import type { AppLogger } from '../logging'

export type ServiceContext = {
  logger: AppLogger
  tracer: Tracer
  openai: OpenAIProvider
}

export type HonoEnv = {
  Bindings: Env
  Variables: {
    services: ServiceContext
  } & RequestIdVariables
}
