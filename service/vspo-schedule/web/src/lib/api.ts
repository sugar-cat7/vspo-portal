import { mockEvents } from "@/data/mocks/events";
import { mockFreechats } from "@/data/mocks/freechats";
import { mockLivestreams } from "@/data/mocks/livestreams";
import { VspoEvent } from "@/types/events";
import { Livestream } from "@/types/streaming";
import axios from "axios";
import { API_ROOT, ENVIRONMENT } from "./Const";
import {
  convertThumbnailQualityInObjects,
  formatDate,
  getLiveStatus,
  getOneWeekRange,
} from "./utils";

export const fetchEvents = async ({
  lang = "ja",
}: {
  lang?: string;
}): Promise<VspoEvent[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<VspoEvent[]>(
        `${API_ROOT}/api/events/recent`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
          params: {
            lang: lang,
          },
        },
      );
      return response.data;
    } else {
      return mockEvents;
    }
  } catch (error) {
    console.warn("Failed to fetch events:", error);
    throw error;
  }
};

export const fetchLivestreams = async ({
  limit = 300,
  lang = "ja",
  status = "all",
  order,
  startedDate,
  endedDate,
  timezone = "UTC",
}: {
  limit?: number;
  lang?: string;
  status?: string;
  order: "desc" | "asc";
  startedDate: string;
  endedDate: string;
  timezone?: string;
}): Promise<Livestream[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<Livestream[]>(
        `${API_ROOT}/api/livestreams/recent`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
          params: {
            limit: limit,
            lang: lang,
            status: status,
            order: order,
            started_at: startedDate,
            ended_at: endedDate,
            timezone: timezone,
          },
        },
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockLivestreams);
    }
  } catch (error) {
    console.warn("Failed to fetch livestreams:", error);
    throw error;
  }
};

export const fetchLivestreamForTab = async ({
  startedDate,
  endedDate,
  timezone = "UTC",
}: {
  startedDate: string;
  endedDate: string;
  timezone?: string;
}): Promise<Livestream[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<Livestream[]>(
        `${API_ROOT}/api/livestreams/tab`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
          params: {
            started_at: startedDate,
            ended_at: endedDate,
            timezone: timezone,
          },
        },
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockLivestreams);
    }
  } catch (error) {
    console.warn("Failed to fetch livestreams:", error);
    throw error;
  }
};

export const fetchFreechats = async ({
  lang = "ja",
}: {
  lang?: string;
}): Promise<Livestream[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<Livestream[]>(
        `${API_ROOT}/api/freechat`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
          params: {
            lang: lang,
          },
        },
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockFreechats);
    }
  } catch (error) {
    console.warn("Failed to fetch freechats:", error);
    throw error;
  }
};

export type RelatedProps = {
  liveStreams: Livestream[];
};

export const fetchRelatedVideos = async (
  page = 1,
  limit = 10,
  lang = "ja",
): Promise<RelatedProps> => {
  const { oneWeekAgo, oneWeekLater } = getOneWeekRange();
  const pastLivestreams = await fetchLivestreams({
    limit: 50,
    startedDate: formatDate(oneWeekAgo, "yyyy-MM-dd"),
    endedDate: formatDate(oneWeekLater, "yyyy-MM-dd"),
    order: "desc",
    lang,
  });
  const liveStreams = pastLivestreams.filter(
    (livestream) => getLiveStatus(livestream) === "live",
  );

  return {
    liveStreams: liveStreams.slice((page - 1) * limit, page * limit),
  };
};

// Create an axios instance
const api = axios.create({
  baseURL: "/api", // your base API url, for example '/api'
});

export const fetcher = <T>(url: string) =>
  api.get<T>(url).then((res) => res.data);
