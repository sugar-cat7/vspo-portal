import { z } from '@hono/zod-openapi'

const PaginationResponseSchema = z.object({
  currentPage: z.number().int().openapi({
    example: 1,
    description: 'Current Page',
  }),
  prevPage: z.number().int().optional().openapi({
    example: 1,
    description: 'Previous Page',
  }),
  nextPage: z.number().int().optional().openapi({
    example: 1,
    description: 'Next Page',
  }),
  totalPage: z.number().int().openapi({
    example: 1,
    description: 'Total Pages',
  }),
  totalCount: z.number().int().openapi({
    example: 1,
    description: 'Total Count',
  }),
  hasNext: z.boolean().openapi({
    example: true,
    description: 'Has Next',
  }),
})

const PaginationQuerySchema = z.object({
  limit: z
    .string()
    .min(1)
    .optional()
    .openapi({
      description: 'Maximum number of items to retrieve per page',
      example: '10',
      param: {
        name: 'limit',
        in: 'query',
      },
    }),
  page: z
    .string()
    .min(1)
    .optional()
    .openapi({
      description: 'Page number to start retrieving items(starts from 1)',
      example: '1',
      param: {
        name: 'page',
        in: 'query',
      },
    }),
})

type PaginationResponse = z.infer<typeof PaginationResponseSchema>
type PaginationQuery = z.infer<typeof PaginationQuerySchema>

const dateStringify = z.preprocess((arg) => {
  if (arg instanceof Date) {
    return arg.toISOString()
  }
  return arg
}, z.string())

export {
  PaginationResponseSchema,
  PaginationQuerySchema,
  type PaginationResponse,
  type PaginationQuery,
  dateStringify,
}
