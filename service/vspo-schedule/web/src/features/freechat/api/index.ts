import { ListFreechats200FreechatsItem, VSPOApi } from "@vspo-lab/api";
import { BaseError, Err, Ok, Result } from "@vspo-lab/error";
import { Freechat, freechatSchema } from "../domain";

export type FetchFreechatsParams = {
  lang?: string;
  sessionId?: string;
};

export type FreechatFetchResult = Result<
  {
    freechats: Freechat[];
  },
  BaseError
>;

const mapToFreechat = (
  apiFreechat: ListFreechats200FreechatsItem,
): Freechat => {
  return freechatSchema.parse({
    id: apiFreechat.id,
    type: "freechat",
    title: apiFreechat.title,
    description: apiFreechat.description,
    platform: apiFreechat.platform,
    thumbnailUrl: apiFreechat.thumbnailURL,
    viewCount: apiFreechat.viewCount,
    status: "live", // Assuming freechats are typically live
    scheduledStartTime: apiFreechat.publishedAt,
    scheduledEndTime: null,
    channelId: apiFreechat.rawChannelID,
    channelTitle: apiFreechat.creatorName || "",
    channelThumbnailUrl: apiFreechat.creatorThumbnailURL || "",
    link: apiFreechat.link || "",
    videoPlayerLink: apiFreechat.videoPlayerLink || "",
    chatPlayerLink: apiFreechat.chatPlayerLink || "",
    tags: apiFreechat.tags || [],
  });
};

/**
 * Fetches freechat streams using the VSPOApi
 */
export const fetchFreechats = async (
  params: FetchFreechatsParams = {},
): Promise<FreechatFetchResult> => {
  const api = new VSPOApi({
    apiKey: process.env.API_KEY_V2,
    baseUrl: process.env.API_URL_V2,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
    sessionId: params.sessionId,
  });

  const result = await api.freechats.list({
    limit: "100",
    page: "0",
    languageCode: params.lang === "ja" ? "default" : params.lang || "default",
    orderBy: "asc",
    orderKey: "creatorName",
  });

  if (!result.val) {
    return Err(result.err);
  }
  const freechats = result.val.freechats.map(mapToFreechat);
  return Ok({
    freechats: freechats,
  });
};
