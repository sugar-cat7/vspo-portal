import { z } from "zod";
import { zCommonEnv } from "./common";

export const zWorkerEnv = z
  .object({
    YOUTUBE_API_KEY: z.string(),
    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCASTING_ACCESS_TOKEN: z.string(),
    DEV_DB_CONNECTION_STRING: z.string(),
    DB: z.custom<Hyperdrive>(),
    WRITE_QUEUE: z.custom<Queue>(),
  })
  .merge(zCommonEnv);

export type AppWorkerEnv = z.infer<typeof zWorkerEnv>;
