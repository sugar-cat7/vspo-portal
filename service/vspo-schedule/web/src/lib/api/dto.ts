import { Result } from "@vspo-lab/error";
import { ListClips200, ListClips200ClipsItem } from "@vspo-lab/api";
import { Clip } from "@/types/streaming";

export const mapApiClipsToClips = (result: Result<ListClips200, any>): Clip[] => {
  if (result.err || !result.val) {
    return [];
  }

  return result.val.clips.map((apiClip: ListClips200ClipsItem): Clip => ({
    id: apiClip.id,
    title: apiClip.title,
    description: apiClip.description,
    channelId: apiClip.rawChannelID,
    channelTitle: apiClip.creatorName || "",
    thumbnailUrl: apiClip.thumbnailURL,
    platform: apiClip.platform as any,
    viewCount: apiClip.viewCount?.toString(),
    likeCount: undefined,
    commentCount: undefined,
    createdAt: apiClip.publishedAt,
    link: apiClip.link,
    iconUrl: apiClip.creatorThumbnailURL,
  }));
}; 