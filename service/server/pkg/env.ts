import { z } from 'zod'

export const zEnv = z.object({
  SERVICE_NAME: z.string(),
  // CLOUDFLARE_API_KEY: z.string(),
  // CLOUDFLARE_ZONE_ID: z.string(),
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
  // HYPERDRIVE: z.custom<Hyperdrive>(),
  LOG_QUEUE: z.custom<Queue>(),
  APP_QUEUE: z.custom<Queue>(),
  APP_BUCKET: z.custom<R2Bucket>(),
  APP_DB: z.custom<D1Database>(),
  APP_KV: z.custom<KVNamespace>(),
  APP_VECTORIZE_INDEX: z.custom<VectorizeIndex>(),
  APP_AI: z.custom<Fetcher>(),
})

export type Env = z.infer<typeof zEnv>
