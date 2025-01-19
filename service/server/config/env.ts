import { z } from 'zod'

export const zEnv = z.object({
  SERVICE_NAME: z.string(),
  ENVIRONMENT: z.enum(['production', 'staging', 'development', 'local']),
  LOG_TYPE: z.enum(['pretty', 'json']).default('pretty'),
  LOG_MINLEVEL: z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number.parseInt(s, 10))
    .default('0'),
  LOG_HIDE_POSITION: z
    .string()
    .transform((s) => s === 'true')
    .default('false'),
  OPENAI_API_KEY: z.string(),
  OPENAI_ORGANIZATION: z.string(),
  OPENAI_PROJECT: z.string(),
  OPENAI_BASE_URL: z.string(),
  OTEL_EXPORTER_URL: z.string(),
  BASELIME_API_KEY: z.string(),
  /**
   * Cloudflare Services
   */
  DB: z.custom<Hyperdrive>(),
  LOG_QUEUE: z.custom<Queue>(),
  APP_QUEUE: z.custom<Queue>(),
  APP_BUCKET: z.custom<R2Bucket>(),
  APP_KV: z.custom<KVNamespace>(),
  APP_AI: z.custom<Fetcher>(),
  UPDATE_VIDEOS_WORKFLOW: z.custom<Workflow>(),

  /**
   * Dev
   */
  DEV_DB_CONNECTION_STRING: z.string(),

  /**
   * API Key
   */
  YOUTUBE_API_KEY: z.string(),
  TWITCH_CLIENT_ID: z.string(),
  TWITCH_CLIENT_SECRET: z.string(),
  TWITCASTING_ACCESS_TOKEN: z.string(),
})

export type Env = z.infer<typeof zEnv>
