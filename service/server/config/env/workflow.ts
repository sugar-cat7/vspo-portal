import { z } from "zod";
import { zFeatureFlagEnv } from "./flag";
export const zBindingWorkflowEnv = z
  .object({
    SEARCH_VIDEOS_WORKFLOW: z.custom<Workflow>(),
    SEARCH_CHANNELS_WORKFLOW: z.custom<Workflow>(),
    TRANSLATE_VIDEOS_WORKFLOW: z.custom<Workflow>(),
    TRANSLATE_CREATORS_WORKFLOW: z.custom<Workflow>(),
    DISCORD_SEND_MESSAGES_WORKFLOW: z.custom<Workflow>(),
    SEARCH_MEMBER_VIDEOS_BY_CHANNEL_WORKFLOW: z.custom<Workflow>(),
    DELETE_VIDEOS_WORKFLOW: z.custom<Workflow>(),
    DISCORD_DELETE_ALL_WORKFLOW: z.custom<Workflow>(),
    DISCORD_SEND_MESSAGE_ALL_CHANNEL_WORKFLOW: z.custom<Workflow>(),
    DISCORD_SEND_MESSAGE_CHANNELS_WORKFLOW: z.custom<Workflow>(),
  })
  .merge(zFeatureFlagEnv);
export type BindingWorkflowEnv = z.infer<typeof zBindingWorkflowEnv>;
