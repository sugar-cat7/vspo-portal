import { createRoute } from '@hono/zod-openapi'
import { AppError, ErrorCodeSchema, openApiErrorResponses, wrap } from '../pkg/errors'
import type { App } from '../pkg/hono/app'
import { GetStreamsParamSchema, GetStreamsResponseSchema } from './schema/http'
import { TZDate } from "@date-fns/tz";
import { GetStreamsByTimeRangeWithVideoTypeRow, getStreamsByTimeRangeWithVideoType } from '../pkg/db/postgres/gen/stream_sql'

const getStreamsRoute = createRoute({
  tags: ['stream'],
  operationId: 'streamsKey',
  method: 'get' as const,
  path: '/streams',
  security: [{ bearerAuth: [] }],
  request: {
    query: GetStreamsParamSchema,
  },
  responses: {
    200: {
      description: 'Get Streams',
      content: {
        'application/json': {
          schema: GetStreamsResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
})

export const registerStreamsGetApi = (app: App) =>
  app.openapi(getStreamsRoute, async (c) => {
    const { tracer, db } = c.get('services')
    const req = GetStreamsParamSchema.safeParse(c.req.query())
    if (!req.success) {
      throw new AppError({
        code: ErrorCodeSchema.Enum.BAD_REQUEST,
        message: req.error.message,
      })
    }
    console.log(req.data)
    return tracer.startActiveSpan('getStreamRoute', async (span) => {
      const dbResult = await wrap<GetStreamsByTimeRangeWithVideoTypeRow[], AppError>(
        getStreamsByTimeRangeWithVideoType(db.client, {
          videoType: req.data.streamType,
          startedAt: new TZDate(req.data.startedAt, "UTC"),
          endedAt: new TZDate(req.data.endedAt),
        }),
        (e) =>
          new AppError({
            message: `Failed to db operation: ${e.message}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
          })
        )

        if (dbResult.err) {
          throw dbResult.err
        }

      return c.json(GetStreamsResponseSchema.parse({
        streams: dbResult.val.map((v) => ({
          id: v.id,
          channelId: v.channelId,
          creatorId: v.creatorId,
          platformType: v.platformType,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnailUrl,
          tags: v.tags.split(','),
          liveStatus: v.status,
          startedAt: v.startedAt.toISOString(),
          endedAt: v.endedAt.toISOString(),
        })),
      }), 200)
    })
  })
