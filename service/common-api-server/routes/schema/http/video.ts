import { z } from '@hono/zod-openapi'

const GetStreamsParamSchema = z.object({
  streamType: z.enum(['vspo_stream', 'freechat', 'clip']).openapi({
    description: 'Stream Type',
    example: 'vspo_stream',
  }),
  startedAt: z.string().openapi({
    description: 'Start Time',
    example: '2021-09-01T00:00:00Z',
  }),
  endedAt: z.string().openapi({
    description: 'End Time',
    example: '2021-09-01T00:00:00Z',
  }),
})

const StreamsSchema = z.object({
  id: z.string().openapi({
    description: 'Stream ID',
    example: '123456',
  }),
  channelId: z.string().openapi({
    description: 'Channel ID',
    example: '123456',
  }),
  creatorId: z.string().openapi({
    description: 'Creator ID',
    example: '123456',
  }),
  platformType: z.enum(['youtube', 'twitch', 'twitcasting', 'niconico', 'bilibili']).openapi({
    description: 'Platform Type',
    example: 'youtube',
  }),
  title: z.string().openapi({
    description: 'Title',
    example: 'Title',
  }),
  description: z.string().openapi({
    description: 'Description',
    example: 'Description',
  }),
  thumbnail: z.string().openapi({
    description: 'Thumbnail',
    example: 'https://example.com/thumbnail.jpg',
  }),
  tags: z.array(z.string()).openapi({
    description: 'Tags',
    example: ['tag1', 'tag2'],
  }),
  startedAt: z.string().openapi({
    description: 'Start Time',
    example: '2021-09-01T00:00:00Z',
  }),
  endedAt: z.string().openapi({
    description: 'End Time',
    example: '2021-09-01T00:00:00Z',
  }),
  liveStatus: z.enum(['live', 'upcoming', 'achieve']).openapi({
    description: 'Live Status',
    example: 'live',
  }),
})

const GetStreamsResponseSchema = z.object({
  streams: z.array(StreamsSchema),
})

type GetStreamsResponse = z.infer<typeof GetStreamsResponseSchema>

export {
  StreamsSchema,
  GetStreamsParamSchema,
  GetStreamsResponseSchema,
  type GetStreamsResponse,
}
