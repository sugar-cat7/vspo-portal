import  { z } from "zod";
import { zCommonEnv } from "./common";

export const zDiscordEnv = z.object({
    DISCORD_BOT_TOKEN: z.string(),
}).merge(zCommonEnv);  



export type DiscordEnv = z.infer<typeof zDiscordEnv>;
