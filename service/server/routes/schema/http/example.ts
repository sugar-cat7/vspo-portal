import { z } from '@hono/zod-openapi'

const CreateExampleRequestSchema = z.object({
  name: z.string().openapi({
    description: 'Example Name',
    example: 'Example Alpha',
  }),
})

const CreateExampleResponseSchema = z.object({
  id: z.string().openapi({
    description: 'Example ID',
    example: '123456',
  }),
  name: z.string().openapi({
    description: 'Example Name',
    example: 'Example Alpha',
  }),
})

type CreateExampleResponse = z.infer<typeof CreateExampleResponseSchema>
type CreateExampleRequest = z.infer<typeof CreateExampleRequestSchema>

export {
  CreateExampleRequestSchema,
  CreateExampleResponseSchema,
  type CreateExampleRequest,
  type CreateExampleResponse,
}
