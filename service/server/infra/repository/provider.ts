import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

type ConnectionOptions = {
    connectionString: string;
    // logger?: Logger;
};

export type Database = {
    client: NeonHttpDatabase;
};

export const createDB = (opts: ConnectionOptions): Database => {
    const sql = neon(opts.connectionString);
   return {
         client:  drizzle({ client: sql })
   }
}