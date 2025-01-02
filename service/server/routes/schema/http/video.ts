import { z } from '@hono/zod-openapi'

const CreateVideoRequestSchema = z.object({
  youtubeVideoIds: z.string().openapi({
    description: 'Youtube Video ID',
    example: '123456',
  }),
  twitchVideoIds: z.string().openapi({
    description: 'Twitch Video ID',
    example: '123456',
  }),
})

const VideoTypeSchema = z.enum(["vspo_stream", "clip", "freechat"]);
const StatusSchema = z.enum(["live", "upcoming", "ended", "unknown"]);
const PlatformSchema = z.enum(["youtube", "twitch", "twitcasting", "niconico", "unknown"]);
const ThumbnailURLSchema = z.string().url();

const VideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    rawChannelID: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    startedAt: z.date().nullable(),
    endedAt: z.date().nullable(),
    platform: PlatformSchema,
    status: StatusSchema,
    tags: z.array(z.string()),
    viewCount: z.number().int().nonnegative(),
    thumbnailURL: ThumbnailURLSchema,
    videoType: VideoTypeSchema,
  });

const CreateVideoResponseSchema = z.array(VideoSchema);

type CreateVideoResponse = z.infer<typeof CreateVideoResponseSchema>
type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>

export {
  CreateVideoRequestSchema,
  CreateVideoResponseSchema,
  type CreateVideoRequest,
  type CreateVideoResponse,
}
