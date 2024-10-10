import type { Tracer } from '@opentelemetry/api'
import type { RequestIdVariables } from 'hono/request-id'
import type { Database } from '../db/postgres/provider'
import type { Env } from '../env'
import type { AppLogger } from '../logging'

export type ServiceContext = {
  logger: AppLogger
  db: Database
  tracer: Tracer
}

export type HonoEnv = {
  Bindings: Env
  Variables: {
    services: ServiceContext
  } & RequestIdVariables
}
