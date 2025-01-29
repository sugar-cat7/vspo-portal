import { z } from "zod";

export const zAIEnv = z.object({
  OPENAI_API_KEY: z.string(),
  OPENAI_ORGANIZATION: z.string(),
  OPENAI_PROJECT: z.string(),
  OPENAI_BASE_URL: z.string(),
});

export type AIEnv = z.infer<typeof zAIEnv>;
