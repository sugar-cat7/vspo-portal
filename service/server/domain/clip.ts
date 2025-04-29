import { z } from "zod";
import { ThumbnailURLSchema } from "./thumbnail";
import { BaseVideoSchema, type Platform, PlatformSchema } from "./video";

// Function to get clip link
const getClipLink = (
  rawId: string,
  platform: Platform,
  channelId?: string, // May be needed for some platforms
): string => {
  switch (platform) {
    case "youtube": // YouTube clips might have /clip/ path, needs verification
      return `https://www.youtube.com/watch?v=/${rawId}`; // Example structure
    case "twitch": // Twitch clips have a specific structure
      return `https://clips.twitch.tv/${rawId}`; // Standard Twitch clip URL
    // Add cases for twitcasting, niconico if they have distinct clip URLs
    // e.g. case "twitcasting": return `${platformLinks.twitcasting}${channelId}/clip/${rawId}`;
    default:
      // Fallback might be less reliable for clips
      console.warn(
        `Clip link generation not implemented for platform: ${platform}`,
      );
      return ""; // Return empty or a best guess
  }
};

// Helper function for Twitch thumbnail URL formatting
const formatTwitchThumbnail = (url: string): string =>
  url
    .replace("%{width}", "400")
    .replace("%{height}", "220")
    .replace("-{width}x{height}", "-400x220")
    .replace("http://", "https://");

// Clip Schema (extends Base, may add clip-specific fields later)
const ClipSchema = BaseVideoSchema.extend({
  // Potential Clip specific fields:
  // duration: z.number().optional(),
  // viewCount: z.number().int().nonnegative().optional(), // Clips might have view counts too
}).transform((clip) => {
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

  const platformIconURL = getPlatformIconURL(clip.platform);
  // Attempt to generate a clip link if not provided in DB
  const generatedLink = getClipLink(
    clip.rawId,
    clip.platform,
    clip.rawChannelID,
  );

  const thumbnailURL =
    clip.platform === PlatformSchema.Enum.twitch
      ? formatTwitchThumbnail(clip.thumbnailURL) // Assume same format for clip thumbs
      : clip.thumbnailURL;

  return {
    ...clip,
    platformIconURL,
    link: clip.link || generatedLink, // Use DB link first, then generate
    thumbnailURL,
  };
});

// Array Schemas
const ClipsSchema = z.array(ClipSchema);

// Clip types
type ClipInput = z.input<typeof ClipSchema>; // Includes Base + Clip specifics
type Clip = z.output<typeof ClipSchema>; // Includes Base + Clip specifics + transformed fields
type Clips = z.output<typeof ClipsSchema>;

// Creator functions
const createClip = (clip: ClipInput): Clip => {
  return ClipSchema.parse(clip);
};
const createClips = (clips: ClipInput[]): Clips => {
  return ClipsSchema.parse(clips);
};

export {
  // Schemas
  ClipSchema,
  ClipsSchema,
  // Types
  type ClipInput,
  type Clip,
  type Clips,
  // Creator functions
  createClip,
  createClips,
  // Helper functions
  getClipLink,
};
