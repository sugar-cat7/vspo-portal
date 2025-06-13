import { convertToUTC, getCurrentUTCString } from "@vspo-lab/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "@vspo-lab/error";
import { AppLogger } from "@vspo-lab/logging";
import { type Streams, createStream, createStreams } from "../../domain/stream";
import { withTracerResult } from "../http/trace/cloudflare";

type GetStreamsParams = {
  channelIds?: string[];
  roomIds?: string[];
};

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

// Add new response type for user info
interface BilibiliUserInfoResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    uid: number;
    uname: string;
    face: string;
    sign: string;
    rank: number;
    level: number;
    jointime: number;
    moral: number;
    silence: number;
    email_status: number;
    tel_status: number;
    identification: number;
    vip: {
      type: number;
      status: number;
      due_date: number;
      vip_pay_type: number;
      theme_type: number;
      label: {
        path: string;
        text: string;
        label_theme: string;
      };
      avatar_subscript: number;
      nickname_color: string;
    };
    pendant: {
      pid: number;
      name: string;
      image: string;
      expire: number;
      image_enhance: string;
      image_enhance_frame: string;
    };
    nameplate: {
      nid: number;
      name: string;
      image: string;
      image_small: string;
      level: string;
      condition: string;
    };
    official: {
      role: number;
      title: string;
      desc: string;
      type: number;
    };
    birthday: string;
    school: {
      name: string;
    };
    profession: {
      name: string;
    };
    tags: string[];
    sys_notice: Record<string, unknown>;
    live_room: {
      roomStatus: number;
      liveStatus: number;
      url: string;
      title: string;
      cover: string;
      watched_show: {
        switch: boolean;
        num: number;
        text_small: string;
        text_large: string;
        icon: string;
        icon_location: string;
        icon_web: string;
      };
      roomid: number;
      roundStatus: number;
      broadcast_type: number;
    };
    serie: {
      series_list: unknown[];
    };
    is_senior_member: number;
    mcn_info: null;
    gaia_res_type: number;
    gaia_data: null;
    is_risk: boolean;
    elec: {
      show_info: {
        show: boolean;
        state: number;
        title: string;
        icon: string;
        jump_url: string;
      };
    };
    contract: {
      is_display: boolean;
      is_follow_display: boolean;
    };
  };
}

const fetchFromBilibili = async <T>(
  endpoint: string,
  params: Record<string, string | number>,
  retryCount = 0,
): Promise<Result<T, AppError>> => {
  return withTracerResult(
    "BilibiliService",
    "fetchFromBilibili",
    async (span) => {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value.toString());
      }

      const maxRetries = 1;
      const baseDelay = 1000; // 1 second

      // Generate a random buvid3 cookie to prevent 412 errors
      // Format: 8 hex chars - 4 hex chars - 4 hex chars - 4 hex chars - 12 hex chars + timestamp + "infoc"
      const generateBuvid3 = () => {
        const randomHex = (length: number) =>
          Array.from({ length }, () =>
            Math.floor(Math.random() * 16).toString(16),
          )
            .join("")
            .toUpperCase();

        const part1 = randomHex(8);
        const part2 = randomHex(4);
        const part3 = randomHex(4);
        const part4 = randomHex(4);
        const part5 = randomHex(12);
        const timestamp = Math.floor(Date.now() / 1000)
          .toString()
          .padStart(5, "0");

        return `${part1}-${part2}-${part3}-${part4}-${part5}${timestamp}infoc`;
      };

      const result = await wrap(
        fetch(`${endpoint}?${queryParams.toString()}`, {
          headers: {
            Referer: "https://www.bilibili.com/",
            Cookie: `buvid3=${generateBuvid3()}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }),
        (err) =>
          new AppError({
            message: `Network error when fetching from ${endpoint}: ${err.message}. Params: ${JSON.stringify(params)}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (result.err) {
        AppLogger.debug("Bilibili API returned error", {
          service: "Debug BilibiliService",
          endpoint,
          params,
          error: result.err.message,
          code: result.err.code,
          cause: result.err.cause,
        });
        return Err(result.err);
      }

      // Handle 412 Precondition Failed with retry logic
      if (!result.val.ok) {
        const status = result.val.status;
        const statusText = result.val.statusText;

        // If it's a 412 and we haven't exhausted retries, wait and retry
        if (status === 412 && retryCount < maxRetries) {
          const delay = baseDelay * 1 ** retryCount; // Exponential backoff
          AppLogger.warn("Bilibili API returned 412, retrying", {
            service: "BilibiliService",
            endpoint,
            params,
            retryCount,
            delayMs: delay,
          });

          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchFromBilibili(endpoint, params, retryCount + 1);
        }

        // For other errors or exhausted retries, return error
        return Err(
          new AppError({
            message: `Bilibili API returned error status: ${status} ${statusText} for ${endpoint}. Params: ${JSON.stringify(params)}${retryCount > 0 ? ` (after ${retryCount} retries)` : ""}`,
            code: status === 412 ? "RATE_LIMITED" : "INTERNAL_SERVER_ERROR",
          }),
        );
      }

      const data = await wrap(
        result.val.json() as Promise<T>,
        (err) =>
          new AppError({
            message: `Failed to parse JSON response from ${endpoint}: ${err.message}. Params: ${JSON.stringify(params)}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (data.err) return Err(data.err);
      return Ok(data.val);
    },
  );
};

// Add helper function to validate room IDs
const isValidRoomId = (roomId: string): boolean => {
  const numericRoomId = Number.parseInt(roomId, 10);
  // Bilibili room IDs are typically smaller numbers, not 16-digit numbers like 3546695948306751
  // Valid room IDs are usually between 1 and 50000000 (50 million)
  return (
    !Number.isNaN(numericRoomId) &&
    numericRoomId > 0 &&
    numericRoomId <= 50000000
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
      // Validate input parameters
      if (!params.channelIds && !params.roomIds) {
        return Err(
          new AppError({
            message: "Either channelIds or roomIds must be provided",
            code: "BAD_REQUEST",
          }),
        );
      }

      if (params.channelIds && params.roomIds) {
        return Err(
          new AppError({
            message:
              "Cannot provide both channelIds and roomIds. Please choose one.",
            code: "BAD_REQUEST",
          }),
        );
      }

      // Validate room IDs if provided
      if (params.roomIds) {
        const invalidRoomIds = params.roomIds.filter(
          (roomId) => !isValidRoomId(roomId),
        );
        if (invalidRoomIds.length > 0) {
          AppLogger.warn("Invalid room IDs detected", {
            service: "BilibiliService",
            invalidRoomIds,
            message: `Invalid room IDs: ${invalidRoomIds.join(", ")}. Room IDs should be positive integers <= 50,000,000`,
          });
        }
      }

      const promises: Array<
        Promise<
          | { id: string; error: AppError }
          | {
              id: string;
              roomInfo: BilibiliRoomInfoResponse["data"];
              masterInfo: BilibiliMasterInfoResponse["data"] | null;
            }
        >
      > = [];

      // Handle channelIds
      if (params.channelIds) {
        const channelPromises = params.channelIds.map(
          async (
            channelId,
          ): Promise<
            | { id: string; error: AppError }
            | {
                id: string;
                roomInfo: BilibiliRoomInfoResponse["data"];
                masterInfo: BilibiliMasterInfoResponse["data"] | null;
              }
          > => {
            // First, get user info to get the room_id
            const userInfoResult =
              await fetchFromBilibili<BilibiliUserInfoResponse>(
                "https://api.bilibili.com/x/space/acc/info",
                { mid: channelId },
              );

            if (userInfoResult.err) {
              AppLogger.error("Bilibili user info API returned error", {
                service: "BilibiliService",
                channelId,
                error: userInfoResult.err,
              });
              return { id: channelId, error: userInfoResult.err };
            }

            const userInfo = userInfoResult.val;
            if (userInfo.code !== 0) {
              return {
                id: channelId,
                error: new AppError({
                  message: `Bilibili user info API returned error for channel ${channelId}: ${userInfo.message} (code: ${userInfo.code})`,
                  code: "INTERNAL_SERVER_ERROR",
                }),
              };
            }

            const roomId = userInfo.data.live_room?.roomid;
            if (!roomId) {
              return {
                id: channelId,
                error: new AppError({
                  message: `No live room found for channel ${channelId}`,
                  code: "NOT_FOUND",
                }),
              };
            }

            // Get room info
            const roomInfoResult =
              await fetchFromBilibili<BilibiliRoomInfoResponse>(
                "https://api.live.bilibili.com/room/v1/Room/get_info",
                { room_id: roomId },
              );

            if (roomInfoResult.err) {
              AppLogger.error("Bilibili room info API returned error", {
                service: "BilibiliService",
                channelId,
                roomId,
                error: roomInfoResult.err,
              });
              return { id: channelId, error: roomInfoResult.err };
            }

            const roomInfo = roomInfoResult.val;
            if (roomInfo.code !== 0) {
              return {
                id: channelId,
                error: new AppError({
                  message: `Bilibili room info API returned error for channel ${channelId}, room ${roomId}: ${roomInfo.message} (code: ${roomInfo.code})`,
                  code: "INTERNAL_SERVER_ERROR",
                }),
              };
            }

            // Get master info for additional details
            const masterInfoResult =
              await fetchFromBilibili<BilibiliMasterInfoResponse>(
                "https://api.live.bilibili.com/live_user/v1/Master/info",
                { uid: channelId },
              );

            const masterInfo = masterInfoResult.err
              ? null
              : masterInfoResult.val;

            if (masterInfoResult.err) {
              AppLogger.error("Bilibili master info API returned error", {
                service: "BilibiliService",
                channelId,
                error: masterInfoResult.err,
              });
            }
            if (!masterInfoResult.err && masterInfo && masterInfo.code !== 0) {
              // Log the warning but don't fail the entire operation
              AppLogger.warn("Bilibili master info API returned error", {
                service: "BilibiliService",
                channelId,
                bilibiliCode: masterInfo.code,
                bilibiliMessage: masterInfo.message,
                message: `Master info API error for channel ${channelId}: ${masterInfo.message} (code: ${masterInfo.code})`,
              });
            }

            return {
              id: channelId,
              roomInfo: roomInfo.data,
              masterInfo: masterInfo?.code === 0 ? masterInfo.data : null,
            };
          },
        );
        promises.push(...channelPromises);
      }

      // Handle roomIds
      if (params.roomIds) {
        const roomPromises = params.roomIds.map(
          async (
            roomId,
          ): Promise<
            | { id: string; error: AppError }
            | {
                id: string;
                roomInfo: BilibiliRoomInfoResponse["data"];
                masterInfo: BilibiliMasterInfoResponse["data"] | null;
              }
          > => {
            // Get room info
            const roomInfoResult =
              await fetchFromBilibili<BilibiliRoomInfoResponse>(
                "https://api.live.bilibili.com/room/v1/Room/get_info",
                { room_id: roomId },
              );

            if (roomInfoResult.err) {
              AppLogger.error("Bilibili room info API returned error", {
                service: "BilibiliService",
                roomId,
                error: roomInfoResult.err,
              });
              return { id: roomId, error: roomInfoResult.err };
            }

            const roomInfo = roomInfoResult.val;
            if (roomInfo.code !== 0) {
              // Categorize different types of Bilibili API errors
              const isRoomNotFound =
                roomInfo.code === 1 &&
                roomInfo.message?.includes("未找到该房间");
              const errorCode = isRoomNotFound
                ? "NOT_FOUND"
                : "INTERNAL_SERVER_ERROR";

              return {
                id: roomId,
                error: new AppError({
                  message: `Bilibili room info API returned error for room ${roomId}: ${roomInfo.message} (code: ${roomInfo.code}, ttl: ${roomInfo.ttl})`,
                  code: errorCode,
                }),
              };
            }

            // Get master info for additional details
            const masterInfoResult =
              await fetchFromBilibili<BilibiliMasterInfoResponse>(
                "https://api.live.bilibili.com/live_user/v1/Master/info",
                { uid: roomInfo.data.uid },
              );

            const masterInfo = masterInfoResult.err
              ? null
              : masterInfoResult.val;

            if (masterInfoResult.err) {
              AppLogger.error("Bilibili master info API returned error", {
                service: "BilibiliService",
                roomId,
                error: masterInfoResult.err,
              });
            }
            if (!masterInfoResult.err && masterInfo && masterInfo.code !== 0) {
              // Log the warning but don't fail the entire operation
              AppLogger.warn("Bilibili master info API returned error", {
                service: "BilibiliService",
                uid: roomInfo.data.uid,
                roomId,
                bilibiliCode: masterInfo.code,
                bilibiliMessage: masterInfo.message,
                message: `Master info API error for uid ${roomInfo.data.uid}: ${masterInfo.message} (code: ${masterInfo.code})`,
              });
            }

            return {
              id: roomId,
              roomInfo: roomInfo.data,
              masterInfo: masterInfo?.code === 0 ? masterInfo.data : null,
            };
          },
        );
        promises.push(...roomPromises);
      }

      const settledResults = await Promise.allSettled(promises);

      // Collect errors and successful results separately
      const errors: Array<{ id: string; error: AppError }> = [];
      const successfulStreams = settledResults
        .map((result, index) => {
          const currentId =
            params.channelIds?.[index] || params.roomIds?.[index] || "";

          if (result.status === "rejected") {
            errors.push({
              id: currentId,
              error: new AppError({
                message: `Promise rejected for id ${currentId}: ${result.reason}`,
                code: "INTERNAL_SERVER_ERROR",
                cause: result.reason,
              }),
            });
            return null;
          }

          if ("error" in result.value) {
            errors.push({
              id: result.value.id,
              error: result.value.error,
            });
            return null;
          }

          return result.value;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .map((result) => {
          const { roomInfo, masterInfo } = result;
          const status = determineStreamStatus(roomInfo.live_status);

          return createStream({
            id: "",
            rawId: roomInfo.room_id.toString(),
            rawChannelID: roomInfo.uid.toString(),
            languageCode: "default",
            title: roomInfo.title || "Untitled Stream",
            description: roomInfo.description || roomInfo.title || "",
            publishedAt: roomInfo.live_time
              ? convertToUTC(roomInfo.live_time)
              : getCurrentUTCString(),
            startedAt:
              status === "live"
                ? roomInfo.live_time
                  ? convertToUTC(roomInfo.live_time)
                  : getCurrentUTCString()
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

      // Log errors for debugging but don't fail the entire operation
      if (errors.length > 0) {
        const totalRequested =
          (params.channelIds?.length || 0) + (params.roomIds?.length || 0);

        // Categorize errors for better logging
        const roomNotFoundErrors = errors.filter(
          (e) => e.error.code === "NOT_FOUND",
        );
        const rateLimitedErrors = errors.filter(
          (e) => e.error.code === "RATE_LIMITED",
        );
        const otherErrors = errors.filter(
          (e) => !["NOT_FOUND", "RATE_LIMITED"].includes(e.error.code),
        );

        const logLevel =
          rateLimitedErrors.length > 0 || otherErrors.length > 0
            ? "error"
            : "warn";
        const logMethod =
          logLevel === "error" ? AppLogger.error : AppLogger.warn;

        logMethod("Bilibili service encountered errors", {
          service: "BilibiliService",
          failedCount: errors.length,
          totalRequested,
          successful: successfulStreams.length,
          roomNotFoundCount: roomNotFoundErrors.length,
          rateLimitedCount: rateLimitedErrors.length,
          otherErrorsCount: otherErrors.length,
          errors: errors.map((e) => ({
            id: e.id,
            message: e.error.message,
            code: e.error.code,
          })),
        });
      }

      return Ok(createStreams(successfulStreams));
    });
  };

  return {
    getStreams,
  };
};
