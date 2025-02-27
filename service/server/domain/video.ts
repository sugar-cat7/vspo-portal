import { z } from "zod";
import { formatToLocalizedDate, getCurrentUTCDate } from "../pkg/dayjs";
import { ThumbnailURLSchema } from "./thumbnail";
import { TargetLangSchema } from "./translate";

const VideoTypeSchema = z.enum(["vspo_stream", "clip", "freechat"]);
const StatusSchema = z.enum(["live", "upcoming", "ended", "unknown"]);
const PlatformSchema = z.enum([
  "youtube",
  "twitch",
  "twitcasting",
  "niconico",
  "unknown",
]);

const platformIconURLs: Record<Platform, string> = {
  youtube:
    "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/server/assets/icon/youtube.png",
  twitch:
    "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/server/assets/icon/twitch.png",
  twitcasting:
    "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/server/assets/icon/twitcasting.png",
  niconico:
    "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/server/assets/icon/niconico.png",
  unknown: "",
};
const getPlatformIconURL = (platform: Platform): string => {
  return platformIconURLs[platform] ?? "";
};

const platformLinks: Record<Platform, string> = {
  youtube: "https://www.youtube.com/watch?v=",
  twitch: "https://www.twitch.tv/",
  twitcasting: "https://twitcasting.tv/",
  niconico: "https://www.nicovideo.jp/watch/",
  unknown: "",
};

// Function to get the video link
const getVideoLink = (
  id: string,
  platform: Platform,
  channelId?: string,
  status?: Status,
): string => {
  switch (platform) {
    case "youtube":
      return `${platformLinks.youtube}${id}`;
    case "twitch":
      return status === "live"
        ? `${platformLinks.twitch}${channelId}`
        : `${platformLinks.twitch}videos/${id}`;
    case "twitcasting":
      return `${platformLinks.twitcasting}${channelId}/movie/${id}`;
    case "niconico":
      return `${platformLinks.niconico}${id}`;
    default:
      return "";
  }
};

// Discord Embed colors for each status
const statusColors: Record<Status, number> = {
  upcoming: 65280, // Green  (0x00ff00)
  live: 16711680, // Red    (0xff0000)
  ended: 255, // Blue   (0x0000ff)
  unknown: 8421504, // Grey   (0x808080, Default)
} as const;

// Function to get the video status color
const getStatusColor = (status: Status): number => {
  return statusColors[status] ?? statusColors.unknown;
};

// Function to extract status from status color
export const getStatusFromColor = (color: number): Status => {
  const foundEntry = Object.entries(statusColors).find(
    ([_, value]) => value === color,
  );
  if (foundEntry) {
    const key = foundEntry[0];
    if (isStatus(key)) {
      return key;
    }
  }
  return "unknown";
};

// Type guard function to ensure key is a valid Status
const isStatus = (key: string): key is Status => {
  return key in statusColors;
};

const VideoSchema = z
  .object({
    id: z.string(),
    rawId: z.string(),
    title: z.string(),
    languageCode: TargetLangSchema,
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
    creatorName: z.string().optional(),
    creatorThumbnailURL: ThumbnailURLSchema.optional(),
    link: z.string().optional(),
  })
  .transform((video) => ({
    ...video,
    platformIconURL: getPlatformIconURL(video.platform),
    link:
      video.link ||
      getVideoLink(
        video.rawId,
        video.platform,
        video.rawChannelID,
        video.status,
      ),
    statusColor: getStatusColor(video.status),
    formattedStartedAt: formatToLocalizedDate(
      video.startedAt ?? getCurrentUTCDate(),
      video.languageCode,
    ),
    formattedEndedAt: formatToLocalizedDate(
      video.endedAt ?? getCurrentUTCDate(),
      video.languageCode,
    ),
    thumbnailURL:
      video.platform === PlatformSchema.Enum.twitch
        ? video.thumbnailURL
            .replace("%{width}", "320")
            .replace("%{height}", "180")
            .replace("-{width}x{height}", "-320x180")
            .replace("http://", "https://")
        : video.thumbnailURL,
  }));

const VideosSchema = z.array(VideoSchema);

type Platform = z.infer<typeof PlatformSchema>;
type Status = z.infer<typeof StatusSchema>;
type Video = z.infer<typeof VideoSchema>;
type Videos = z.output<typeof VideosSchema>;
type VideoInput = z.input<typeof VideoSchema>;
type VideosInput = z.input<typeof VideosSchema>;

const createVideo = (video: VideoInput): Video => {
  return VideoSchema.parse(video);
};

const createVideos = (videos: VideosInput): Videos => {
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
  type VideoInput,
  type VideosInput,
  createVideo,
  createVideos,
};
