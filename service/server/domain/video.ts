import { z } from "zod";
import { IYoutubeService, query } from "../infra";
import { ThumbnailURLSchema } from "./thumbnail";

const VideoTypeSchema = z.enum(["vspo_stream", "clip", "freechat"]);
const StatusSchema = z.enum(["live", "upcoming", "ended", "unknown"]);
const PlatformSchema = z.enum([
  "youtube",
  "twitch",
  "twitcasting",
  "niconico",
  "unknown",
]);

const VideoSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  title: z.string(),
  rawChannelID: z.string(),
  description: z.string(),
  publishedAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  platform: PlatformSchema,
  status: StatusSchema,
  tags: z.array(z.string()),
  viewCount: z.number().int().nonnegative(),
  thumbnailURL: ThumbnailURLSchema,
  videoType: VideoTypeSchema,
  creatorThumbnailURL: ThumbnailURLSchema.optional(),
});

const VideosSchema = z.array(VideoSchema);

type Platform = z.infer<typeof PlatformSchema>;
type Video = z.infer<typeof VideoSchema>;
type Videos = z.infer<typeof VideosSchema>;

const createVideo = (video: Video): Video => {
  return VideoSchema.parse(video);
};

const createVideos = (videos: Videos): Videos => {
  return VideosSchema.parse(videos);
};

export {
  VideoSchema,
  VideosSchema,
  VideoTypeSchema,
  StatusSchema,
  PlatformSchema,
  type Video,
  type Videos,
  type Platform,
  createVideo,
  createVideos,
};
