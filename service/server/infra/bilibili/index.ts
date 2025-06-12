import { convertToUTC, getCurrentUTCString } from "@vspo-lab/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "@vspo-lab/error";
import { type Streams, createStream, createStreams } from "../../domain/stream";
import { withTracerResult } from "../http/trace/cloudflare";

type GetStreamsParams = { roomIds: string[] };

export interface IBilibiliService {
  getStreams(params: GetStreamsParams): Promise<Result<Streams, AppError>>;
}

// Bilibili API response types
interface BilibiliRoomInfoResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    uid: number;
    room_id: number;
    short_id: number;
    attention: number;
    online: number;
    is_portrait: boolean;
    description: string;
    live_status: number; // 0: not streaming, 1: streaming, 2: rebroadcast
    area_id: number;
    parent_area_id: number;
    parent_area_name: string;
    old_area_id: number;
    background: string;
    title: string;
    user_cover: string;
    keyframe: string;
    is_strict_room: boolean;
    live_time: string;
    tags: string;
    is_anchor: number;
    room_silent_type: string;
    room_silent_level: number;
    room_silent_second: number;
    area_name: string;
    pendants: string;
    area_pendants: string;
    hot_words: string[];
    hot_words_status: number;
    verify: string;
    new_pendants: {
      frame: {
        name: string;
        value: string;
        position: number;
        desc: string;
        area: number;
        area_old: number;
        bg_color: string;
        bg_pic: string;
        use_old_area: boolean;
      } | null;
      badge: {
        name: string;
        position: number;
        value: string;
        desc: string;
      } | null;
      mobile_frame: {
        name: string;
        value: string;
        position: number;
        desc: string;
        area: number;
        area_old: number;
        bg_color: string;
        bg_pic: string;
        use_old_area: boolean;
      } | null;
      mobile_badge: null;
    };
    up_session: string;
    pk_status: number;
    pk_id: number;
    battle_id: number;
    allow_change_area_time: number;
    allow_upload_cover_time: number;
    studio_info: {
      status: number;
      master_list: unknown[];
    };
  };
}

interface BilibiliMasterInfoResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    info: {
      uid: number;
      uname: string;
      face: string;
      official_verify: {
        type: number;
        desc: string;
      };
      gender: number;
    };
    exp: {
      master_level: {
        level: number;
        current: [number, number];
        next: [number, number];
      };
    };
    follower_num: number;
    room_id: number;
    medal_name: string;
    glory_count: number;
    pendant: string;
    link_group_num: number;
    room_news: {
      content: string;
      ctime: string;
      ctime_text: string;
    };
  };
}

const fetchFromBilibili = async <T>(
  endpoint: string,
  params: Record<string, string | number>,
): Promise<Result<T, AppError>> => {
  return withTracerResult(
    "BilibiliService",
    "fetchFromBilibili",
    async (span) => {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value.toString());
      }

      const result = await wrap(
        fetch(`${endpoint}?${queryParams.toString()}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Referer: "https://live.bilibili.com/",
          },
        }),
        (err) =>
          new AppError({
            message: `Network error: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (result.err) return Err(result.err);
      if (!result.val.ok) {
        return Err(
          new AppError({
            message: `Bilibili API error: ${result.val.status}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
        );
      }

      const data = await wrap(
        result.val.json() as Promise<T>,
        (err) =>
          new AppError({
            message: `Failed to parse response: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
          }),
      );

      if (data.err) return Err(data.err);
      return Ok(data.val);
    },
  );
};

const determineStreamStatus = (
  liveStatus: number,
): "live" | "upcoming" | "ended" | "unknown" => {
  switch (liveStatus) {
    case 1:
      return "live";
    case 2:
      return "live"; // rebroadcast is also considered live
    default:
      return "ended"; // not streaming
  }
};

export const createBilibiliService = (): IBilibiliService => {
  const getStreams = async (
    params: GetStreamsParams,
  ): Promise<Result<Streams, AppError>> => {
    return withTracerResult("BilibiliService", "getStreams", async (span) => {
      const promises = params.roomIds.map(async (roomId) => {
        // Get room info
        const roomInfoResult =
          await fetchFromBilibili<BilibiliRoomInfoResponse>(
            "https://api.live.bilibili.com/room/v1/Room/get_info",
            { room_id: roomId },
          );

        if (roomInfoResult.err) return { roomId, error: roomInfoResult.err };

        const roomInfo = roomInfoResult.val;
        if (roomInfo.code !== 0) {
          return {
            roomId,
            error: new AppError({
              message: `Bilibili API error: ${roomInfo.message}`,
              code: "INTERNAL_SERVER_ERROR",
            }),
          };
        }

        // Get master info for additional details
        const masterInfoResult =
          await fetchFromBilibili<BilibiliMasterInfoResponse>(
            "https://api.live.bilibili.com/live_user/v1/Master/info",
            { uid: roomInfo.data.uid },
          );

        const masterInfo = masterInfoResult.err ? null : masterInfoResult.val;

        return {
          roomId,
          roomInfo: roomInfo.data,
          masterInfo: masterInfo?.code === 0 ? masterInfo.data : null,
        };
      });

      const settledResults = await Promise.allSettled(promises);

      // Collect only successful results
      const successfulStreams = settledResults
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<{
            roomId: string;
            roomInfo: BilibiliRoomInfoResponse["data"];
            masterInfo: BilibiliMasterInfoResponse["data"] | null;
          }> =>
            result.status === "fulfilled" &&
            "roomInfo" in result.value &&
            !("error" in result.value),
        )
        .map((result) => {
          const { roomInfo, masterInfo } = result.value;
          const status = determineStreamStatus(roomInfo.live_status);

          return createStream({
            id: "",
            rawId: roomInfo.room_id.toString(),
            rawChannelID: roomInfo.uid.toString(),
            languageCode: "default",
            title: roomInfo.title || "Untitled Stream",
            description: roomInfo.description || roomInfo.title || "",
            publishedAt: roomInfo.live_time || getCurrentUTCString(),
            startedAt:
              status === "live"
                ? roomInfo.live_time || getCurrentUTCString()
                : null,
            endedAt: status === "ended" ? getCurrentUTCString() : null,
            platform: "bilibili",
            status,
            tags: roomInfo.tags ? roomInfo.tags.split(",").filter(Boolean) : [],
            viewCount: roomInfo.online || 0,
            thumbnailURL:
              roomInfo.user_cover ||
              roomInfo.keyframe ||
              roomInfo.background ||
              "",
            creatorName: masterInfo?.info.uname,
            creatorThumbnailURL: masterInfo?.info.face,
            link: `https://live.bilibili.com/${roomInfo.room_id}`,
          });
        });

      return Ok(createStreams(successfulStreams));
    });
  };

  return {
    getStreams,
  };
};
