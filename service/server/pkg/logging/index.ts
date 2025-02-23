import { AsyncLocalStorage } from "node:async_hooks";
import { type ISettingsParam, Logger as TSLogger } from "tslog";
import type { CommonEnv } from "../../config/env/common";
import { createUUID } from "../uuid";

interface Fields {
  [key: string]: unknown;
}

interface CustomLogger {
  debug(message: string, fields?: Fields): void;
  info(message: string, fields?: Fields): void;
  warn(message: string, fields?: Fields): void;
  error(message: string, fields?: Fields): void;
}

interface LogObject {
  requestId?: string;
  message?: string;
  details?: Fields;
  error?: Error;
  service?: string;
}

interface LogContext {
  requestId: string;
  additionalFields?: Fields;
  service?: string;
}

const loggerStorage = new AsyncLocalStorage<LogContext>();

const createLoggerConfig = (env?: CommonEnv) =>
  ({
    name: "vspo-portal-server",
    type: env?.LOG_TYPE || "pretty",
    minLevel: env?.LOG_MINLEVEL || 0,
    hideLogPositionForProduction: env?.LOG_HIDE_POSITION || true,
  }) satisfies ISettingsParam<LogObject>;

class AppLogger implements CustomLogger {
  private static instance: AppLogger;
  private loggerInstance: TSLogger<LogObject>;

  private constructor(env?: CommonEnv) {
    const loggerConfig = createLoggerConfig(env);
    this.loggerInstance = new TSLogger(loggerConfig);
    // TODO: Transport logs to a log management system
    this.loggerInstance.attachTransport((_logObj) => {});
  }

  static getInstance(env?: CommonEnv): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger(env);
    }
    return AppLogger.instance;
  }

  private getContext(): LogContext {
    const context = loggerStorage.getStore();
    if (!context) {
      return { requestId: createUUID() };
    }
    return context;
  }

  static async runWithContext<T>(
    context: Partial<LogContext>,
    fn: () => Promise<T>,
  ): Promise<T> {
    const fullContext: LogContext = {
      requestId: context.requestId || createUUID(),
      additionalFields: context.additionalFields,
      service: context.service,
    };
    return loggerStorage.run(fullContext, fn);
  }

  static getCurrentRequestId(): string | undefined {
    return loggerStorage.getStore()?.requestId;
  }

  static getAdditionalFields(): Fields | undefined {
    return loggerStorage.getStore()?.additionalFields;
  }

  static debug(message: string, fields?: Fields): void {
    AppLogger.getInstance().debug(message, fields);
  }

  static info(message: string, fields?: Fields): void {
    AppLogger.getInstance().info(message, fields);
  }

  static warn(message: string, fields?: Fields): void {
    AppLogger.getInstance().warn(message, fields);
  }

  static error(message: string, fields?: Fields): void {
    AppLogger.getInstance().error(message, fields);
  }

  debug(message: string, fields?: Fields): void {
    const context = this.getContext();
    this.loggerInstance.debug({
      message,
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
  }

  info(message: string, fields?: Fields): void {
    const context = this.getContext();
    this.loggerInstance.info({
      message,
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
  }

  warn(message: string, fields?: Fields): void {
    const context = this.getContext();
    this.loggerInstance.warn({
      message,
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
  }

  error(message: string, fields?: Fields): void {
    const context = this.getContext();
    this.loggerInstance.error({
      message,
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
  }
}

export { type CustomLogger, type LogContext, AppLogger };
