// import type { Tracer } from '@opentelemetry/api'
import type { RequestIdVariables } from 'hono/request-id'
import type { Env } from '../../../config/env'
import type { AppLogger } from '../../../pkg/logging'
import { Container } from '../../dependency'
import { getContext } from 'hono/context-storage'


export type ServiceContext = {
  logger: AppLogger
  // tracer: Tracer
  di: Container
}

export type HonoEnv = {
  Bindings: Env
  Variables: {
    services: ServiceContext
  } & RequestIdVariables
}


export const getLogger = () => {
  return getContext<HonoEnv>()?.var?.services?.logger
}