import axios from "axios";
import { VspoEvent } from "@/types/events";
import { Clip, Livestream } from "@/types/streaming";
import { mockClips, mockTwitchClips } from "@/data/mocks/clips";
import { mockEvents } from "@/data/mocks/events";
import { mockFreeChats } from "@/data/mocks/freechats";
import { mockLivestreams } from "@/data/mocks/livestreams";
import {
  convertThumbnailQualityInObjects,
  getLiveStatus,
  shuffleClips,
} from "./utils";
import { API_ROOT, ENVIRONMENT } from "./Const";

export const fetchEvents = async (): Promise<VspoEvent[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<VspoEvent[]>(
        `${API_ROOT}/api/events/recent`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
        },
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
      return mockEvents;
    }
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw error;
  }
};

export const fetchLivestreams = async ({
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
        },
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockLivestreams);
    }
  } catch (error) {
    console.error("Failed to fetch livestreams:", error);
    throw error;
  }
};

export const fetchFreeChats = async (): Promise<Livestream[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<Livestream[]>(
        `${API_ROOT}/api/freechat`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
        },
      );
      return convertThumbnailQualityInObjects(response.data);
    } else {
      return convertThumbnailQualityInObjects(mockFreeChats);
    }
  } catch (error) {
    console.error("Failed to fetch freechats:", error);
    throw error;
  }
};

export const fetchClips = async (): Promise<Clip[]> => {
  try {
    if (ENVIRONMENT === "production") {
      const response = await axios.get<{ pastClips: Clip[] }>(
        `${API_ROOT}/api/clips/youtube`,
        {
          headers: {
            "x-api-key": process.env.API_KEY,
          },
        },
      );
      return convertThumbnailQualityInObjects(response.data.pastClips);
    } else {
      return mockClips;
    }
  } catch (error) {
    console.error("Failed to fetch YouTube clips:", error);
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
      return convertThumbnailQualityInObjects(mockTwitchClips);
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
  limit = 10,
): Promise<RelatedProps> => {
  const pastLivestreams = await fetchLivestreams({ limit: 50 });
  const liveStreams = pastLivestreams.filter(
    (livestream) => getLiveStatus(livestream) === "live",
  );

  const pastClips = await fetchClips();
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

export const fetcher = <T>(url: string) =>
  api.get<T>(url).then((res) => res.data);
