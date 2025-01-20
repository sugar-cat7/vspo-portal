import { z } from '@hono/zod-openapi'
import { PaginationQuerySchema, PaginationResponseSchema } from './common';

const CreateVideoRequestSchema = z.object({
  youtubeVideoIds: z.array(z.string()).openapi({
    description: 'YouTube Video ID',
    example: ['123456'],
  }),
  twitchVideoIds: z.array(z.string()).openapi({
    description: 'Twitch Video ID',
    example: ['123456'],
  }),
})

const VideoTypeSchema = z.enum(["vspo_stream", "clip", "freechat"]).openapi({
  description: 'Video Type',
  example: 'vspo_stream',
});
const StatusSchema = z.enum(["live", "upcoming", "ended", "unknown"]).openapi({
  description: 'Status',
  example: 'live',
});
const PlatformSchema = z.enum(["youtube", "twitch", "twitcasting", "niconico", "unknown"]).openapi({
  description: 'Platform',
  example: 'youtube',
});
const ThumbnailURLSchema = z.string().openapi({
  description: 'Thumbnail URL',
  example: 'https://example.com',
});

const VideoSchema = z.object({
    id: z.string().openapi({
      description: 'Video UUID',
      example: '123456',
    }),
    title: z.string().openapi({
      description: 'Video Title',
      example: 'Hello, World!',
    }),
    rawChannelID: z.string().openapi({
      description: 'Raw Channel ID',
      example: '123456',
    }),
    description: z.string().openapi({
      description: 'Description',
      example: 'Hello, World!',
    }),
    publishedAt: z.date().openapi({
      description: 'Published At',
      example: '2022-01-01T00:00:00.000Z',
    }),
    startedAt: z.date().nullable().openapi({
      description: 'Started At',
      example: '2022-01-01T00:00:00.000Z',
    }),
    endedAt: z.date().nullable().openapi({
      description: 'Ended At',
      example: '2022-01-01T00:00:00.000Z',
    }),
    platform: PlatformSchema,
    status: StatusSchema,
    tags: z.array(z.string()).openapi({
      description: 'Tags',
      example: ['Hello', 'World'],
    }),
    viewCount: z.number().int().nonnegative().openapi({
      description: 'View Count',
      example: 1,
    }),
    thumbnailURL: ThumbnailURLSchema,
    videoType: VideoTypeSchema,
    creatorThumbnailURL: ThumbnailURLSchema.optional().openapi({
      description: 'Creator Thumbnail URL',
      example: 'https://example.com',
    }),
  });

const CreateVideoResponseSchema = z.array(VideoSchema);

type CreateVideoResponse = z.infer<typeof CreateVideoResponseSchema>
type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>

const ListVideoRequestSchema = PaginationQuerySchema.merge(z.object({
  platform: PlatformSchema.optional().openapi({
    description: 'Platform',
    example: 'youtube',
    param: {
      name: 'platform',
      in: 'query',
    },
  }),
  status: StatusSchema.optional().openapi({
    description: 'Status',
    example: 'live',
    param: {
      name: 'status',
      in: 'query',
    },
  }),
  videoType: VideoTypeSchema.optional().openapi({
    description: 'Video Type',
    example: 'vspo_stream',
    param: {
      name: 'videoType',
      in: 'query',
    },
  }),
  startedAt: z.string().optional().openapi({
    description: 'Started At',
    example: '2022-01-01T00:00:00.000Z',
    param: {
      name: 'startedAt',
      in: 'query',
    },
  }),
  endedAt: z.string().optional().openapi({
    description: 'Ended At',
    example: '2022-01-01T00:00:00.000Z',
    param: {
      name: 'endedAt',
      in: 'query',
    },
  }),
}));

const ListVideoResponseSchema = z.object({
  videos: z.array(VideoSchema),
  pagination: PaginationResponseSchema,
});

type ListVideoResponse = z.infer<typeof ListVideoResponseSchema>
type ListVideoRequest = z.infer<typeof ListVideoRequestSchema>

export {
  CreateVideoRequestSchema,
  CreateVideoResponseSchema,
  type CreateVideoRequest,
  type CreateVideoResponse,
  ListVideoRequestSchema,
  ListVideoResponseSchema,
  type ListVideoRequest,
  type ListVideoResponse,
}
