import { z } from "zod";

export const zFeatureFlagEnv = z.object({
  DISCORD_TRANSLATION_SETTING: z.boolean().optional(),
});
export type FeatureFlagEnv = z.infer<typeof zFeatureFlagEnv>;
