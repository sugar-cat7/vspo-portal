// import type { Tracer } from '@opentelemetry/api'
import type { RequestIdVariables } from 'hono/request-id'
import type { Env } from '../../../config/env'
import type { AppLogger } from '../../../pkg/logging'
import { getContext } from 'hono/context-storage'
import { ApplicationService } from '../../../cmd/server/internal/application'



export type ServiceContext = {
  logger: AppLogger
}

type AppEnv = Env & {
  APP_WORKER: Service<ApplicationService>
}

export type HonoEnv = {
  Bindings: AppEnv
  Variables: {
    services: ServiceContext
  } & RequestIdVariables
}


export const getLogger = () => {
  return getContext<HonoEnv>()?.var?.services?.logger
}