import { z } from "zod";
import { livestreamSchema } from "@/features/schedule/domain";

// Freechat model that extends the Livestream type
export const freechatSchema = livestreamSchema.extend({
  type: z.literal("freechat"),
});

export type Freechat = z.infer<typeof freechatSchema>;
