import { VSPOApi, ListClips200ClipsItem } from "@vspo-lab/api";
import { Result, Ok, Err, BaseError } from "@vspo-lab/error";
import {
  Clip,
  clipSchema,
  Platform,
  paginationSchema,
  Pagination,
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
    title: apiClip.title,
    description: apiClip.description,
    thumbnailUrl: apiClip.thumbnailURL,
    platform: apiClip.platform as Platform,
    url: apiClip.link || "",
    viewCount: apiClip.viewCount,
    likeCount: 0,
    channelId: apiClip.rawChannelID,
    channelTitle: apiClip.creatorName || "",
    channelThumbnailUrl: apiClip.creatorThumbnailURL || "",
    createdAt: apiClip.publishedAt,
  });
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
    apiKey: process.env.API_KEY,
    baseUrl: process.env.API_URL,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
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

  if (result.err) {
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
