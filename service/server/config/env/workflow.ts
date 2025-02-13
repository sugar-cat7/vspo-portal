import { z } from "zod";

export const zBindingWorkflowEnv = z.object({
  SEARCH_VIDEOS_WORKFLOW: z.custom<Workflow>(),
  SEARCH_CHANNELS_WORKFLOW: z.custom<Workflow>(),
  TRANSLATE_VIDEOS_WORKFLOW: z.custom<Workflow>(),
  TRANSLATE_CREATORS_WORKFLOW: z.custom<Workflow>(),
  DISCORD_SEND_MESSAGES_WORKFLOW: z.custom<Workflow>(),
});
export type BindingWorkflowEnv = z.infer<typeof zBindingWorkflowEnv>;
