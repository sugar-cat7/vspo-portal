import { livestreamSchema } from "@/features/shared/domain/livestream";
import { z } from "zod";

// Freechat model that extends the Livestream type
export const freechatSchema = livestreamSchema.extend({
  type: z.literal("freechat"),
});

export type Freechat = z.infer<typeof freechatSchema>;
