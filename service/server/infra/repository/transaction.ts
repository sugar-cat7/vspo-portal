import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction, PgTransactionConfig } from "drizzle-orm/pg-core";
import {
  AppError,
  BaseError,
  ErrorCodeSchema,
  Result,
  wrap,
} from "../../pkg/errors";
import { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { AppLogger } from "../../pkg/logging";
import { getLogger } from "../http/hono";

export interface IDbConfig {
  connectionString: string; 
  isQueryLoggingEnabled: boolean;
}

export type DB = PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>

export interface ITxManager {
  runTx<T, E extends BaseError>(
    operation: (tx: DB) => Promise<Result<T, E>>,
    config?: PgTransactionConfig
  ): Promise<Result<T, E>>;
}

const defaultConfig: PgTransactionConfig = {
  isolationLevel: "read committed",
  accessMode: "read write",
  deferrable: false,
};

export class TxManager implements ITxManager {
  constructor(private readonly dbConfig: IDbConfig) {}

  async runTx<T, E extends BaseError>(
    operation: (tx: DB) => Promise<Result<T, E>>,
    config?: PgTransactionConfig
  ): Promise<Result<T, E>> {
    const db = drizzle({
      connection: this.dbConfig.connectionString,
      logger: this.dbConfig.isQueryLoggingEnabled
    });

    const result = await wrap(
      db.transaction(async (tx) => {
        const op = await operation(tx);
        if (op.err) {
          const logger = new AppLogger();
          logger.error(`Failed to execute transaction: ${op.err}`);
          tx.rollback();
        }
        return op;
      }, config ?? defaultConfig),
      (e) =>
        new AppError({
          message: `Failed to execute transaction: ${e}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        })
    );
    if (result.err) {
      throw result.err;
    }
    return result.val;
  }
}
