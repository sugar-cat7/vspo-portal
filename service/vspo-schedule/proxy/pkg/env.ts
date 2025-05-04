import { z } from "zod";

export const zEnv = z.object({
  CLOUDFLARE_API_KEY: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  LOG_TYPE: z.enum(["pretty", "json"]).default("pretty"),
  LOG_MINLEVEL: z
    .string()
    .regex(/^\d+$/)
    .transform((s) => parseInt(s, 10))
    .default("0"),
  LOG_HIDE_POSITION: z
    .string()
    .transform((s) => s === "true")
    .default("false"),
  SERVICE_NAME: z.string(),
  API_BASE_URL: z.string(),
  APP_KV: z.custom<KVNamespace>(),
  OPENAI_ORGANIZATION: z.string(),
  OPENAI_PROJECT: z.string(),
  OPENAI_API_KEY: z.string(),
  OPENAI_BASE_URL: z.string(),
  BASELIME_API_KEY: z.string(),
});

export type Env = z.infer<typeof zEnv>;
