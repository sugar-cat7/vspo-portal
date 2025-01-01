import { z } from '@hono/zod-openapi'

export const StreamRequestSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(['user', 'assistant']),
    })
  ),
})
