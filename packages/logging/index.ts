import { AsyncLocalStorage } from "node:async_hooks";

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

class AppLogger implements CustomLogger {
  private static instance: AppLogger;

  private constructor() {}

  static getInstance(env?: {
    LOG_TYPE: string;
    LOG_MINLEVEL: number;
    LOG_HIDE_POSITION: boolean;
  }): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger();
    }
    return AppLogger.instance;
  }

  private getContext(): LogContext {
    const context = loggerStorage.getStore();
    if (!context) {
      return { requestId: crypto.randomUUID() };
    }
    return context;
  }

  static async runWithContext<T>(
    context: Partial<LogContext>,
    fn: () => Promise<T>,
  ): Promise<T> {
    const fullContext: LogContext = {
      requestId:
        AppLogger.getCurrentRequestId() ||
        context.requestId ||
        crypto.randomUUID(),
      ...(context.additionalFields
        ? { additionalFields: context.additionalFields }
        : {}),
      ...(context.service ? { service: context.service } : {}),
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
    console.debug(message, {
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
    // this.loggerInstance.debug(message, {
    //   requestId: context.requestId,
    //   service: context.service,
    //   ...(context.additionalFields || {}),
    //   ...fields,
    // });
  }

  info(message: string, fields?: Fields): void {
    const context = this.getContext();
    console.info(message, {
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
    // this.loggerInstance.info(message, {
    //   requestId: context.requestId,
    //   service: context.service,
    //   ...(context.additionalFields || {}),
    //   ...fields,
    // });
  }

  warn(message: string, fields?: Fields): void {
    const context = this.getContext();
    console.warn(message, {
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
    // this.loggerInstance.warn(message, {
    //   requestId: context.requestId,
    //   service: context.service,
    //   ...(context.additionalFields || {}),
    //   ...fields,
    // });
  }

  error(message: string, fields?: Fields): void {
    const context = this.getContext();
    console.error(message, {
      requestId: context.requestId,
      service: context.service,
      ...(context.additionalFields || {}),
      ...fields,
    });
    // this.loggerInstance.error(message, {
    //   requestId: context.requestId,
    //   service: context.service,
    //   ...(context.additionalFields || {}),
    //   ...fields,
    // });
  }
}

export { type CustomLogger, type LogContext, AppLogger };
