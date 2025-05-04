import { formatToLocalizedDate } from "@vspo-lab/dayjs";
import { z } from "zod";
import { BaseVideoSchema, type Platform, PlatformSchema } from "./video";

const StatusSchema = z.enum(["live", "upcoming", "ended", "unknown"]); // Specific to Streams

// Discord Embed colors for each status (Stream specific)
const statusColors: Record<Status, number> = {
  upcoming: 65280, // Green  (0x00ff00)
  live: 16711680, // Red    (0xff0000)
  ended: 255, // Blue   (0x0000ff)
  unknown: 8421504, // Grey   (0x808080, Default)
} as const;

// Function to get the stream status color
const getStatusColor = (status: Status): number => {
  return statusColors[status] ?? statusColors.unknown;
};

// Function to extract status from status color
const getStatusFromColor = (color: number): Status => {
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

// Function to get stream link (handles live vs VOD for Twitch)
const getStreamLink = (
  rawId: string,
  platform: Platform,
  channelId?: string,
  status?: Status, // Status is relevant for Twitch stream links
): string => {
  const platformLinks: Record<Platform, string> = {
    youtube: "https://www.youtube.com/watch?v=",
    twitch: "https://www.twitch.tv/", // Base URL, specific paths added below
    twitcasting: "https://twitcasting.tv/",
    niconico: "https://www.nicovideo.jp/watch/",
    unknown: "",
  };

  switch (platform) {
    case "youtube":
      return `${platformLinks.youtube}${rawId}`;
    case "twitch":
      // Live streams use channel ID, VODs use video ID
      return status === "live" && channelId
        ? `${platformLinks.twitch}${channelId}`
        : `${platformLinks.twitch}videos/${rawId}`;
    case "twitcasting":
      // Requires channelId for the link structure
      return channelId
        ? `${platformLinks.twitcasting}${channelId}/movie/${rawId}`
        : ""; // Cannot construct link without channelId
    case "niconico":
      return `${platformLinks.niconico}${rawId}`;
    default:
      return "";
  }
};

// Helper function for Twitch thumbnail URL formatting
const formatTwitchThumbnail = (url: string): string =>
  url
    .replace("%{width}", "400")
    .replace("%{height}", "220")
    .replace("-{width}x{height}", "-400x220")
    .replace("http://", "https://");

// Stream Schema (extends Base, adds stream-specific fields)
const StreamSchema = BaseVideoSchema.extend({
  // Stream specific fields from streamStatusTable
  status: StatusSchema,
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
}).transform((stream) => {
  const getPlatformIconURL = (platform: Platform): string => {
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
    return platformIconURLs[platform] ?? "";
  };

  const platformIconURL = getPlatformIconURL(stream.platform);
  const generatedLink = getStreamLink(
    stream.rawId,
    stream.platform,
    stream.rawChannelID,
    stream.status, // Pass status for link generation
  );
  const statusColor = getStatusColor(stream.status);
  const formattedStartedAt = stream.startedAt
    ? formatToLocalizedDate(stream.startedAt, stream.languageCode)
    : null; // Keep null if not started
  const formattedEndedAt = stream.endedAt
    ? formatToLocalizedDate(stream.endedAt, stream.languageCode)
    : null; // Keep null if not ended

  const thumbnailURL =
    stream.platform === PlatformSchema.Enum.twitch
      ? formatTwitchThumbnail(stream.thumbnailURL)
      : stream.thumbnailURL;

  return {
    ...stream,
    platformIconURL,
    link: stream.link || generatedLink, // Use DB link first, then generate
    statusColor,
    formattedStartedAt,
    formattedEndedAt,
    thumbnailURL,
  };
});

// Array Schemas
const StreamsSchema = z.array(StreamSchema);

// Type inference
type Status = z.infer<typeof StatusSchema>; // Stream status

// Stream types
type StreamInput = z.input<typeof StreamSchema>; // Includes Base + Stream specifics
type Stream = z.output<typeof StreamSchema>; // Includes Base + Stream specifics + transformed fields
type Streams = z.output<typeof StreamsSchema>;

// Creator functions
const createStream = (stream: StreamInput): Stream => {
  return StreamSchema.parse(stream);
};
const createStreams = (streams: StreamInput[]): Streams => {
  return StreamsSchema.parse(streams);
};

export {
  // Schemas
  StreamSchema,
  StreamsSchema,
  StatusSchema, // Stream status enum
  // Types
  type Status,
  type StreamInput,
  type Stream,
  type Streams,
  // Creator functions
  createStream,
  createStreams,
  // Helper functions
  getStatusFromColor,
  getStatusColor,
  getStreamLink,
};
