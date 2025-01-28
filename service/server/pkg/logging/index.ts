import { type ISettingsParam, Logger as TSLogger } from "tslog";

import type { AppEnv } from "../../config/env";
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
}

const createLoggerConfig = (env?: AppEnv) =>
  ({
    name: "vspo-portal-server",
    type: env?.LOG_TYPE || "json",
    minLevel: env?.LOG_MINLEVEL || 0,
    hideLogPositionForProduction: env?.LOG_HIDE_POSITION || true,
  }) satisfies ISettingsParam<LogObject>;

class AppLogger implements CustomLogger {
  private loggerInstance: TSLogger<LogObject>;
  private requestId: string;

  constructor(opts?: { env?: AppEnv; requestId?: string }) {
    const loggerConfig = createLoggerConfig(opts?.env);
    this.loggerInstance = new TSLogger(loggerConfig);
    this.requestId = opts?.requestId || createUUID();
    // TODO: Transport logs to a log management system
    this.loggerInstance.attachTransport((_logObj) => {});
  }

  debug(message: string, fields?: Fields): void {
    this.loggerInstance.debug({
      message,
      ...{ requestId: this.requestId },
      ...fields,
    });
  }

  info(message: string, fields?: Fields): void {
    this.loggerInstance.info({
      message,
      ...{ requestId: this.requestId },
      ...fields,
    });
  }

  warn(message: string, fields?: Fields): void {
    this.loggerInstance.warn({
      message,
      ...{ requestId: this.requestId },
      ...fields,
    });
  }

  error(message: string, fields?: Fields): void {
    this.loggerInstance.error({
      message,
      ...{ requestId: this.requestId },
      ...fields,
    });
  }
}

export { type CustomLogger, AppLogger };
