import { BaseError, Err, Ok, Result } from "@vspo-lab/error";
import { Channel, Clip } from "../domain";
import { fetchClips } from "./clipService";
import { fetchVspoMembers } from "./memberService";

export type HomePageData = {
  popularYoutubeClips: Clip[];
  popularShortsClips: Clip[];
  popularTwitchClips: Clip[];
  vspoMembers: Channel[];
};

export type FetchHomePageDataResult = Result<HomePageData, BaseError>;

export type FetchHomePageDataOptions = {
  beforePublishedAtDate?: string;
  afterPublishedAtDate?: string;
};

/**
 * Fetch all data needed for the home page
 */
export const fetchHomePageData = async (
  options?: FetchHomePageDataOptions,
): Promise<FetchHomePageDataResult> => {
  const ITEMS_PER_CATEGORY = 10;
  // Fetch YouTube videos, YouTube Shorts, Twitch clips and VSPO members in parallel
  const [
    popularYoutubeResponse,
    popularShortsResponse,
    popularTwitchResponse,
    vspoMembersResponse,
  ] = await Promise.all([
    fetchClips({
      platform: "youtube",
      page: 0,
      limit: ITEMS_PER_CATEGORY,
      clipType: "clip",
      order: "desc",
      orderKey: "viewCount",
      beforePublishedAtDate: options?.beforePublishedAtDate,
      afterPublishedAtDate: options?.afterPublishedAtDate,
    }),
    fetchClips({
      platform: "youtube",
      page: 0,
      limit: ITEMS_PER_CATEGORY,
      clipType: "short",
      order: "desc",
      orderKey: "viewCount",
      beforePublishedAtDate: options?.beforePublishedAtDate,
      afterPublishedAtDate: options?.afterPublishedAtDate,
    }),
    fetchClips({
      platform: "twitch",
      page: 0,
      limit: ITEMS_PER_CATEGORY,
      clipType: "clip",
      order: "desc",
      orderKey: "viewCount",
      beforePublishedAtDate: options?.beforePublishedAtDate,
      afterPublishedAtDate: options?.afterPublishedAtDate,
    }),
    fetchVspoMembers(),
  ]);

  // Error checking
  if (popularYoutubeResponse.err) {
    return Err(popularYoutubeResponse.err);
  }

  if (popularShortsResponse.err) {
    return Err(popularShortsResponse.err);
  }

  if (popularTwitchResponse.err) {
    return Err(popularTwitchResponse.err);
  }

  if (vspoMembersResponse.err) {
    return Err(vspoMembersResponse.err);
  }

  // Format and return data
  return Ok({
    popularYoutubeClips: popularYoutubeResponse.val.clips,
    popularShortsClips: popularShortsResponse.val.clips,
    popularTwitchClips: popularTwitchResponse.val.clips,
    vspoMembers: vspoMembersResponse.val.members,
  });
};
