import axios from "axios";
import { VspoEvent } from "@/types/events";
import { events } from "@/data/events";
import { Clip, Livestream } from "@/types/streaming";
import { mockClips, mockTwitchClips } from "@/data/clips";
import { mockLiveStreams } from "@/data/livestreams";
import {
  convertThumbnailQualityInObjects,
  isStatusLive,
  shuffleClips,
} from "./utils";
import { API_ROOT, BASE_URL, ENVIRONMENT } from "./Const";
import { mockFreeChats } from "@/data/freechats";
import createClient from "openapi-fetch";
import type { paths } from "./generated/schema";

export const fetchVspoEvents = async (): Promise<VspoEvent[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<VspoEvent[]>(
        `${API_ROOT}/api/events/recent`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
        }
      );
      const events = response.data.map((event) => {
        // startedAtを 'T' で分割し、日付部分だけを取得
        const datePart = event.startedAt.split("T")[0];

        // datePartと "T00:00:00Z" を結合して新しい日付を作成
        event.startedAt = `${datePart}T00:00:00Z`;

        return event;
      });

      return events;
    } else {
      return events as VspoEvent[];
    }
  } catch (error) {
    console.error("Failed to fetch eventss:", error);
    throw error;
  }
};

export const fetchVspoLivestreams = async ({
  limit = 300,
}: {
  limit?: number;
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
          },
        }
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockLiveStreams) as Livestream[];
    }
  } catch (error) {
    console.error("Failed to fetch livestream:", error);
    throw error;
  }
};

export const fetchVspoClips = async (): Promise<Clip[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<{ pastClips: Clip[] }>(
        `${API_ROOT}/api/clips/youtube`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
        }
      );
      return convertThumbnailQualityInObjects(response.data.pastClips);
    } else {
      return mockClips as Clip[];
    }
  } catch (error) {
    console.error("Failed to fetch eventss:", error);
    throw error;
  }
};

export const fetchFreeChat = async (): Promise<Livestream[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<Livestream[]>(
        `${API_ROOT}/api/freechat`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
        }
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockFreeChats) as Livestream[];
    }
  } catch (error) {
    console.error("Failed to fetch freechat:", error);
    throw error;
  }
};

export const fetchTwitchClips = async (channelId: string): Promise<Clip[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<Clip[]>(`${API_ROOT}/api/clips/twitch`, {
        params: {
          channelId,
        },
        headers: {
          "x-api-key": process.env.API_KEY,
        },
      });
      return response.data;
    } else {
      return convertThumbnailQualityInObjects(mockTwitchClips) as Clip[];
    }
  } catch (error) {
    console.error(`Failed to fetch clips for channel ID ${channelId}:`, error);
    throw error;
  }
};

export type RelatedProps = {
  liveStreams: Livestream[];
  clips: Clip[];
};

export const fetchVspoRelatedVideo = async (
  page = 1,
  limit = 10
): Promise<RelatedProps> => {
  const pastLivestreams = await fetchVspoLivestreams({ limit: 50 });
  const liveStreams = pastLivestreams.filter(
    (livestream) => isStatusLive(livestream) === "live"
  );

  const pastClips = await fetchVspoClips();
  const shuffledClips = shuffleClips(pastClips);
  return {
    liveStreams: liveStreams.slice((page - 1) * limit, page * limit),
    clips: shuffledClips.slice((page - 1) * limit, page * limit),
  };
};

// Create an axios instance
const api = axios.create({
  baseURL: "/api", // your base API url, for example '/api'
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const client = createClient<paths>({
  baseUrl: BASE_URL,
});
