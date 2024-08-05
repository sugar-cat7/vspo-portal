import { Client } from "pg";

type ConnectionOptions = {
  connectionString: string;
  retry: number | false;
  // logger?: Logger;
};

export type Database = {
  client: Client;
};

export const createDB = async (opts: ConnectionOptions): Promise<Database> => {
  let client: Client | null = null;
  let retries = typeof opts.retry === "number" ? opts.retry : 1;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = new Client({
        connectionString: opts.connectionString,
      });
      await client.connect();
      break;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      // オプションでロガーが設定されている場合は、接続失敗を記録
      // opts.logger?.error(`Attempt ${attempt} failed: ${err.message}`);
      await new Promise((res) => setTimeout(res, 1000)); // 再試行の前に1秒待機
    }
  }

  if (!client) {
    throw new Error("Failed to create a client.");
  }

  return {
    client,
  };
};
