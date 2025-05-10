import { ListClips200ClipsItem, VSPOApi } from "@vspo-lab/api";
import { BaseError, Err, Ok, Result } from "@vspo-lab/error";
import {
  Clip,
  Pagination,
  Platform,
  clipSchema,
  paginationSchema,
} from "../domain";

export type FetchClipsParams = {
  page: number;
  limit: number;
  // locale?: string;
  platform: "youtube" | "twitch";
  clipType: "clip" | "short";
  order: "asc" | "desc";
  orderKey: "viewCount" | "publishedAt";
  beforePublishedAtDate?: string;
  afterPublishedAtDate?: string;
  sessionId?: string;
};

export type ClipFetchResult = Result<
  {
    clips: Clip[];
    pagination: Pagination;
  },
  BaseError
>;

const mapToClip = (apiClip: ListClips200ClipsItem): Clip => {
  return clipSchema.parse({
    id: apiClip.rawId,
    type: "clip",
    title: apiClip.title,
    description: apiClip.description,
    thumbnailUrl: apiClip.thumbnailURL,
    platform: apiClip.platform as Platform,
    link: apiClip.link || "",
    viewCount: apiClip.viewCount,
    channelId: apiClip.rawChannelID,
    channelTitle: apiClip.creatorName || "",
    channelThumbnailUrl: apiClip.creatorThumbnailURL || "",
    videoPlayerLink: apiClip.videoPlayerLink || "",
    publishedAt: apiClip.publishedAt,
    tags: apiClip.tags || [],
  } satisfies Clip);
};

/**
 * Fetch clips from the API
 */
export const fetchClips = async (
  params: FetchClipsParams,
): Promise<ClipFetchResult> => {
  const { page, limit, platform, order, orderKey } = params;
  // Initialize API client
  const client = new VSPOApi({
    apiKey: process.env.API_KEY_V2,
    baseUrl: process.env.API_URL_V2,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
    sessionId: params.sessionId,
  });
  const result = await client.clips.list({
    limit: limit.toString(),
    page: page.toString(),
    platform,
    clipType: params.clipType,
    languageCode: "default",
    orderBy: order,
    orderKey: orderKey,
    beforePublishedAtDate: params.beforePublishedAtDate,
    afterPublishedAtDate: params.afterPublishedAtDate,
  });

  if (!result.val) {
    return Err(result.err);
  }

  const clips = result.val.clips.map(mapToClip);

  const pagination = paginationSchema.parse({
    currentPage: result.val.pagination.currentPage,
    totalPages: result.val.pagination.totalPage,
    totalItems: result.val.pagination.totalCount,
    itemsPerPage: limit,
  });

  return Ok({
    clips,
    pagination,
  });
};
