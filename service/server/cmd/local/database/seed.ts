import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import {
  channelTable,
  creatorTable,
  streamStatusTable,
  videoTable,
} from "../../../infra/repository/schema";

async function main() {
  const db = drizzle("postgres://user:password@localhost:5432/vspo");
  await seed(
    db,
    { creatorTable, channelTable, videoTable, streamStatusTable },
    { count: 1000 },
  );
}
main();
