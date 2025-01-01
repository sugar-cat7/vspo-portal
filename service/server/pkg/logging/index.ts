import { type ISettingsParam, Logger as TSLogger } from 'tslog'
import type { Env } from '../env'

interface Fields {
  [key: string]: unknown
}

interface CustomLogger {
  debug(message: string, fields?: Fields): void
  info(message: string, fields?: Fields): void
  warn(message: string, fields?: Fields): void
  error(message: string, fields?: Fields): void
}

interface LogObject {
  requestId?: string
  message?: string
  details?: Fields
  error?: Error
}

const createLoggerConfig = (env: Env) =>
  ({
    name: 'template-api',
    type: env.LOG_TYPE,
    minLevel: env.LOG_MINLEVEL,
    hideLogPositionForProduction: env.LOG_HIDE_POSITION,
    // Add more tslog specific settings as needed
  }) satisfies ISettingsParam<LogObject>

class AppLogger implements CustomLogger {
  private loggerInstance: TSLogger<LogObject>
  private requestId: string

  constructor(opts: { env: Env; requestId: string }) {
    const loggerConfig = createLoggerConfig(opts.env)
    this.loggerInstance = new TSLogger(loggerConfig)
    this.requestId = opts?.requestId || ''
    // TODO: Transport logs to a log management system
    this.loggerInstance.attachTransport((_logObj) => {})
  }

  debug(message: string, fields?: Fields): void {
    this.loggerInstance.debug({message, ...{ requestId: this.requestId }, ...fields })
  }

  info(message: string, fields?: Fields): void {
    this.loggerInstance.info({message, ...{ requestId: this.requestId }, ...fields })
  }

  warn(message: string, fields?: Fields): void {
    this.loggerInstance.warn({message, ...{ requestId: this.requestId }, ...fields })
  }

  error(message: string, fields?: Fields): void {
    this.loggerInstance.error({message, ...{ requestId: this.requestId }, ...fields })
  }
}

export { type CustomLogger, AppLogger }
