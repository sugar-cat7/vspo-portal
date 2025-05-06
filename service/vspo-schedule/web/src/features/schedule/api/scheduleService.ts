import {
  ListStreamsParams,
  VSPOApi,
  ListStreamsMemberType,
  ListStreamsPlatform,
} from "@vspo-lab/api";
import { BaseError, Err, Ok, Result } from "@vspo-lab/error";
import { Livestream, livestreamSchema, Status } from "../domain";
import { convertToUTCDate, convertToUTCTimestamp } from "@/lib/dayjs";
import { eventSchema, Event } from "@/features/events/domain";
export type FetchLivestreamsParams = {
  limit: number;
  lang: string;
  status: "live" | "upcoming" | "archive" | "all";
  order: "asc" | "desc";
  timezone: string;
  startedDate?: string;
  memberType?: string;
  platform?: string;
};

export type FetchEventsParams = {
  lang: string;
};

export type LivestreamFetchResult = Result<
  {
    livestreams: Livestream[];
  },
  BaseError
>;

export type EventFetchResult = Result<
  {
    events: Event[];
  },
  BaseError
>;

/**
 * Fetch livestreams from the API
 */
export const fetchLivestreams = async (
  params: FetchLivestreamsParams,
): Promise<LivestreamFetchResult> => {
  // Initialize API client
  const client = new VSPOApi({
    apiKey: process.env.API_KEY_V2,
    baseUrl: process.env.API_URL_V2,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
  });

  const statusMap: Record<string, Status | undefined> = {
    live: "live",
    upcoming: "upcoming",
    archive: "ended",
    all: undefined,
  };

  const lang = params.lang === "ja" ? "default" : params.lang;

  const startDateFrom = params.startedDate
    ? convertToUTCTimestamp(params.startedDate, params.timezone)
    : undefined;

  const startDateTo = params.startedDate
    ? convertToUTCTimestamp(
        new Date(
          convertToUTCDate(params.startedDate).getFullYear(),
          convertToUTCDate(params.startedDate).getMonth(),
          convertToUTCDate(params.startedDate).getDate() + 1,
        ),
        params.timezone,
      )
    : undefined;

  const param: ListStreamsParams = {
    limit: params.limit.toString(),
    page: "0", // Default to first page
    status: statusMap[params.status] || undefined,
    orderBy: params.order,
    languageCode: lang,
    memberType: (params.memberType || "vspo_all") as ListStreamsMemberType,
  };

  // Add platform filter if provided
  if (params.platform) {
    param.platform = params.platform as ListStreamsPlatform;
  }

  if (params.status === "all") {
    param.startDateFrom = startDateFrom;
    param.startDateTo = startDateTo;
  }

  // Add 30 day limit for ended (archive) streams
  if (params.status === "archive") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    param.startDateFrom = convertToUTCTimestamp(
      thirtyDaysAgo.toISOString(),
      params.timezone,
    );
  }

  // Cast to any to allow the new parameter names until the API client is updated
  const result = await client.streams.list(param);

  if (result.err) {
    return Err(result.err);
  }

  // Transform API data to domain model
  const livestreams = result.val.streams.map((stream) => {
    const livestream = {
      id: stream.rawId,
      type: "livestream",
      title: stream.title,
      description: stream.description,
      platform: stream.platform,
      thumbnailUrl: stream.thumbnailURL,
      viewCount: stream.viewCount,
      status: stream.status,
      scheduledStartTime: stream.startedAt || "",
      scheduledEndTime: stream.endedAt,
      channelId: stream.rawChannelID,
      channelTitle: stream.creatorName || "",
      channelThumbnailUrl: stream.creatorThumbnailURL || "",
      link: stream.link || "",
      videoPlayerLink: stream.videoPlayerLink || "",
      chatPlayerLink: stream.chatPlayerLink || "",
      tags: stream.tags,
    } satisfies Livestream;
    return livestreamSchema.parse(livestream);
  });
  return Ok({
    livestreams,
  });
};

/**
 * Fetch events from the API
 */
export const fetchEvents = async ({
  startedDate,
}: {
  startedDate?: string;
}): Promise<EventFetchResult> => {
  // Initialize API client
  const client = new VSPOApi({
    apiKey: process.env.API_KEY_V2,
    baseUrl: process.env.API_URL_V2,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
  });

  const result = await client.events.list({
    limit: "50",
    page: "0",
    visibility: "public",
    startedDateFrom: startedDate,
    startedDateTo: startedDate,
  });

  if (result.err) {
    return Err(result.err);
  }
  // Transform API data to domain model
  const events = result.val.events.map((event) => {
    const eventData = {
      id: event.id || "",
      type: "event",
      title: event.title,
      startedDate: event.startedDate || "",
      contentSummary: {},
      isNotLink: false,
    } satisfies Event;
    return eventSchema.parse(eventData);
  });

  return Ok({
    events,
  });
};
