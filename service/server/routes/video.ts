import { createRoute } from '@hono/zod-openapi'
import { openApiErrorResponses } from '../pkg/errors'
import type { App } from '../pkg/hono/app'
import { CreateVideoRequestSchema, CreateVideoResponseSchema } from './schema/http'


const postVideosRoute = createRoute({
  tags: ['Video'],
  operationId: 'postVideos',
  method: 'post' as const,
  path: '/videos',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateVideoRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'The configuration for an api',
      content: {
        'application/json': {
          schema: CreateVideoResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
})

export const registerVideoPostApi = (app: App) =>
  app.openapi(postVideosRoute, async (c) => {
    return c.json({ message: 'Hello, World!' }) as any
  })
