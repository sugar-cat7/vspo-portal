// import type { Tracer } from '@opentelemetry/api'
import type { RequestIdVariables } from 'hono/request-id'
import type { Env } from '../env'
import type { AppLogger } from '../logging'
import type { Dependency } from '../../infra/dependency'

export type ServiceContext = {
  logger: AppLogger
  // tracer: Tracer
  di: Dependency
}

export type HonoEnv = {
  Bindings: Env
  Variables: {
    services: ServiceContext
  } & RequestIdVariables
}
