import postgres from "postgres";

type ConnectionOptions = {
    connectionString: string;
    // logger?: Logger;
};

export type Database = {
    client: postgres.Sql;
};

export const createDB = (opts: ConnectionOptions): Database => {
   return {
         client: postgres(opts.connectionString),
   }
}