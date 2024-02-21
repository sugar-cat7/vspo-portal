import { freeChatVideoIds } from "@/data/freechat-video-ids";
import { members } from "@/data/members";
import { VspoEvent } from "@/types/events";
import { Clip, LiveStatus, Livestream, Platform } from "@/types/streaming";
import { Timeframe } from "@/types/timeframe";
import { format, utcToZonedTime } from "date-fns-tz";
import { enUS, ja } from "date-fns/locale";
import { Locale } from "date-fns";
import { TEMP_TIMESTAMP } from "./Const";

/**
 * Group an array of items by a specified key.
 * @template T - The type of items in the array.
 * @param items - The array of items to group.
 * @param keyGetter - A function that returns the key for an item.
 * @returns - An object with keys representing the groups and values as arrays of items.
 */
export const groupBy = <T>(
  items: T[],
  keyGetter: (item: T) => string,
): Record<string, T[]> => {
  const groupedItems: Record<string, T[]> = {};

  for (const item of items) {
    const key = keyGetter(item);

    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }

    groupedItems[key].push(item);
  }

  return groupedItems;
};
type GetLivestreamUrl = {
  videoId: string;
  platform: Platform;
  externalLink?: string;
  memberName?: string;
  twitchUsername?: string;
  actualEndTime?: string;
  twitchPastVideoId?: string;
  isClip?: boolean;
};
/**
 * Get the livestream URL for a video ID and platform.
 * @param videoId - The video ID to generate the URL for.
 * @param platform - The platform of the livestream (e.g., "youtube", "twitch", "twitcasting").
 * @returns - The livestream URL for the video ID and platform.
 */
export const getLivestreamUrl = ({
  videoId,
  platform,
  externalLink,
  memberName,
  twitchUsername,
  twitchPastVideoId,
  isClip,
}: GetLivestreamUrl): string => {
  switch (platform) {
    case Platform.YouTube:
      return `https://www.youtube.com/watch?v=${videoId}`;
    case Platform.Twitch:
      return isClip && externalLink
        ? externalLink
        : !twitchPastVideoId
          ? `https://www.twitch.tv/${twitchUsername}`
          : `https://www.twitch.tv/videos/${twitchPastVideoId}`;
    case Platform.TwitCasting:
      return externalLink?.includes("movie")
        ? externalLink
        : `https://twitcasting.tv/${
            members.filter((m) => m.name === memberName).at(0)
              ?.twitcastingScreenId
          }/movie/${videoId}` || "";
    case Platform.NicoNico:
      return `https://live.nicovideo.jp/watch/${videoId}`;
    default:
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Unsupported platform: ${platform}. Supported platforms are: ${Object.values(
          Platform,
        ).join(", ")}`,
      );
  }
};

/**
 * Filters livestreams based on various criteria.
 *
 * @param livestreamsByDate - An object with date strings as keys and arrays of Livestream objects as values
 * @param searchStartDate - The start date of the search range
 * @param searchEndDate - The end date of the search range
 * @param searchMemberIds - An array of member IDs to filter by
 * @param searchPlatforms - An array of platforms to filter by
 * @param searchKeyword - A keyword to filter by
 * @returns An object with date strings as keys and arrays of filtered Livestream objects as values
 */
export const filterLivestreams = (
  livestreamsByDate: Record<string, Livestream[]>,
  searchStartDate: string | null,
  searchEndDate: string | null,
  searchMemberIds: number[],
  searchPlatforms: string[],
  searchKeyword: string,
): Record<string, Livestream[]> => {
  const filteredLivestreamsByDate: Record<string, Livestream[]> = {};
  const keywordFilter = (item: Livestream) =>
    item.title.toLowerCase().includes(searchKeyword.toLowerCase());
  const startDate = searchStartDate
    ? new Date(searchStartDate.replaceAll("-", "/"))
    : null;
  const endDate = searchEndDate
    ? new Date(searchEndDate.replaceAll("-", "/"))
    : null;

  for (const date in livestreamsByDate) {
    const currentDate = new Date(date);
    const isDateInRange =
      (!startDate || currentDate >= startDate) &&
      (!endDate || currentDate <= endDate);

    const livestreams = livestreamsByDate[date].filter((livestream) => {
      const isChannelMatch =
        searchMemberIds.length === 0 ||
        searchMemberIds.some((memberId) =>
          members
            .filter((m) => m.iconUrl === livestream.iconUrl)
            .some((member) => member.id === memberId),
        );

      const isPlatformMatch =
        searchPlatforms.length === 0 ||
        searchPlatforms.some((s) => s === livestream.platform);

      return (
        isDateInRange &&
        isChannelMatch &&
        isPlatformMatch &&
        keywordFilter(livestream)
      );
    });

    if (livestreams.length > 0) {
      filteredLivestreamsByDate[date] = livestreams;
    }
  }

  return filteredLivestreamsByDate;
};

/**
 * Filters clips based on the given searchMemberIds.
 *
 * @param clips - An array of Clip objects.
 * @param searchMemberIds - An array of member IDs to filter clips by.
 * @returns An array of filtered Clip objects.
 */
const filterClips = (clips: Clip[], searchMemberIds: number[]): Clip[] => {
  if (!clips) {
    return [];
  }
  const titleWeight = 2;
  const descriptionWeight = 1;
  const bracketWeight = 3;
  const hashtagWeight = 3;
  const keywordMatchThreshold = 5;

  const filteredClips = clips.filter((clip) => {
    const isMemberMatch = searchMemberIds.some((memberId) => {
      const memberKeywords = members.find(
        (member) => member.id === memberId,
      )?.keywords;

      if (!memberKeywords) {
        return false;
      }

      let keywordMatchCount = 0;

      memberKeywords.forEach((keyword) => {
        // Check for keyword match in title
        if (clip.title.includes(keyword)) {
          keywordMatchCount += titleWeight;

          // Check for keyword match inside brackets
          const bracketPattern = new RegExp(`【${keyword}】`);
          if (bracketPattern.test(clip.title)) {
            keywordMatchCount += bracketWeight;
          }
        }
      });

      // Check for keyword match in description
      memberKeywords.forEach((keyword) => {
        if (clip.description.includes(keyword)) {
          keywordMatchCount += descriptionWeight;

          // Check for keyword match in hashtag format
          const hashtagPattern = new RegExp(`#${keyword}`);
          if (hashtagPattern.test(clip.description)) {
            keywordMatchCount += hashtagWeight;
          }
        }
      });

      return keywordMatchCount >= keywordMatchThreshold;
    });

    return isMemberMatch;
  });

  return filteredClips;
};

/**
 * Filters livestreams based on their titles.
 * Gives lower priority to streams marked as isTemp if there's another stream with the same title.
 *
 * @param livestreams - An array of Livream objects.
 * @returns An array of filtered Livream objects.
 */
const titleFilter = (livestreams: Livestream[]): Livestream[] => {
  return livestreams.filter((stream, index, self) => {
    const currentTime = new Date(stream.scheduledStartTime);
    const currentTitle = stream.title;

    return !self.some((otherStream, otherIndex) => {
      if (stream.channelId === otherStream.channelId && index !== otherIndex) {
        const otherTime = new Date(otherStream.scheduledStartTime);
        const timeDifference = Math.abs(
          currentTime.getTime() - otherTime.getTime(),
        );

        return (
          timeDifference < 6 * 60 * 60 * 1000 &&
          otherIndex < index &&
          currentTitle === otherStream.title &&
          stream.platform === otherStream.platform &&
          (!stream.isTemp || (stream.isTemp && !otherStream.isTemp))
        );
      }
      return false;
    });
  });
};

/**
 * Removes duplicate livestreams based on their titles.
 *
 * @param livestreams - An array of Livestream objects.
 * @returns An array of unique Livestream objects.
 */
export const removeDuplicateTitles = (
  livestreams: Livestream[],
): Livestream[] => {
  const filteredLivestreams = removeDuplicateTwitchId(titleFilter(livestreams));
  const seenTitles = new Set();
  return filteredLivestreams.filter((livestream) => {
    const isDuplicate = seenTitles.has(livestream.id);
    seenTitles.add(livestream.id);
    return !isDuplicate;
  });
};

/**
 * Removes duplicate livestreams based on their Twitch ID.
 *
 * @param livestreams - An array of Livestream objects.
 * @returns An array of unique Livestream objects.
 */
const removeDuplicateTwitchId = (livestreams: Livestream[]): Livestream[] => {
  const seenTwitchIds = new Set();
  return livestreams.filter((livestream) => {
    if (!livestream.twitchPastVideoId) {
      return true;
    } else {
      const isDuplicate = seenTwitchIds.has(livestream.twitchPastVideoId);
      seenTwitchIds.add(livestream.twitchPastVideoId);
      return !isDuplicate;
    }
  });
};

/**
 * Get a range of one week ago and one week later, without considering the time.
 * @returns - An object with `oneWeekAgo` and `oneWeekLater` properties representing the dates.
 */
export const getOneWeekRange = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set time to 00:00:00

  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

  const oneWeekAgo = new Date(now.getTime() - oneWeekInMilliseconds);
  const oneWeekLater = new Date(now.getTime() + oneWeekInMilliseconds);

  return {
    oneWeekAgo,
    oneWeekLater,
  };
};

const locales: Record<string, Locale> = {
  enUS,
  ja,
};
const localeTimeZoneMap: Record<string, string> = {
  ja: "Asia/Tokyo",
  enUS: "America/New_York",
};

/**
 * Format a date with the given locale and format, converted to the specified timezone.
 * @param date - A Date object or date string to format.
 * @param localeCode - The locale code to use for formatting.
 * @param dateFormat - The date format to use for formatting.
 * @returns - A formatted date string.
 */
export const formatWithTimeZone = (
  date: Date | number | string,
  localeCode: string,
  dateFormat: string,
): string => {
  const timeZone = localeTimeZoneMap[localeCode];
  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, dateFormat, { locale: locales[localeCode] });
};

/**
 * Determines if a livestream is live, upcoming, archived, or is a freechat.
 * @param {Livestream} livestream - The livestream to check the live status of.
 * @returns {LiveStatus | "freechat"} - The live status of the livestream
 *   ("live", "upcoming", or "archive") or "freechat".
 */
export const getLiveStatus = (
  livestream: Livestream,
): LiveStatus | "freechat" => {
  if (freeChatVideoIds.includes(livestream.id)) {
    return "freechat";
  }

  const scheduledStartTime: Date = new Date(livestream.scheduledStartTime);
  const currentTime: Date = new Date();

  // 時間差をミリ秒で計算
  const timeDifference: number = Math.abs(
    scheduledStartTime.getTime() - currentTime.getTime(),
  );

  // 12時間をミリ秒で表す
  const twelveHoursInMilliseconds: number = 12 * 60 * 60 * 1000;

  // 時間差が12時間以内であるかどうかを判断
  const isWithinTwelveHours: boolean =
    timeDifference <= twelveHoursInMilliseconds;
  if (new Date(livestream.scheduledStartTime) > new Date()) {
    return LiveStatus.Upcoming;
  } else if (
    livestream.actualEndTime &&
    livestream.actualEndTime.includes("1998-01-01") &&
    isWithinTwelveHours
  ) {
    return LiveStatus.Live;
  } else {
    return LiveStatus.Archive;
  }
};

const timeRanges = [
  { start: 0, end: 6, label: "00:00 - 06:00" },
  { start: 6, end: 12, label: "06:00 - 12:00" },
  { start: 12, end: 18, label: "12:00 - 18:00" },
  { start: 18, end: 24, label: "18:00 - 24:00" },
];

/**
 * Groups livestreams into time ranges of 6 hours, starting at 0:00.
 * @param {Livestream[]} livestreams - The array of livestreams to group.
 * @returns {Array<{label: string, livestreams: Livestream[]}>} - An array of objects containing a label and an array of livestreams.
 */
export const groupLivestreamsByTimeRange = (livestreams: Livestream[]) => {
  return timeRanges.map((timeRange) => {
    return {
      label: timeRange.label,
      livestreams: livestreams.filter((livestream) => {
        const scheduledStartTime = new Date(livestream.scheduledStartTime);
        const hours = scheduledStartTime.getHours();
        return hours >= timeRange.start && hours < timeRange.end;
      }),
    };
  });
};

/**
 * Sorts an array of clips by their weighted score (a combination of view count, like count, and comment count) and returns the sorted clips.
 * @param {Clip[]} clips - The array of clips to sort.
 * @returns {Clip[]} - An array of sorted clips.
 */
export const sortClipsByPopularity = (clips: Clip[]): Clip[] => {
  return clips.sort((a, b) => {
    const aViewCount = parseInt(a.viewCount ?? "0") || 0;
    const aLikeCount = parseInt(a.likeCount ?? "0") || 0;
    const aCommentCount = parseInt(a.commentCount ?? "0") || 0;

    const bViewCount = parseInt(b.viewCount ?? "0") || 0;
    const bLikeCount = parseInt(b.likeCount ?? "0") || 0;
    const bCommentCount = parseInt(b.commentCount ?? "0") || 0;

    const aWeightedScore = aViewCount * 0.01 + aLikeCount * 0.1 + aCommentCount;
    const bWeightedScore = bViewCount * 0.01 + bLikeCount * 0.1 + bCommentCount;

    return bWeightedScore - aWeightedScore;
  });
};

/**
 * Shuffles an array of clips and returns the shuffled clips.
 * @param {Clip[]} clips - The array of clips to shuffle.
 * @returns {Clip[]} - An array of shuffled clips.
 */
export const shuffleClips = (clips: Clip[]): Clip[] => {
  const newArray = [...clips];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const filterByTimeframe = (
  clips: Clip[],
  timeframe: Timeframe | null,
): Clip[] => {
  if (!timeframe) return clips;

  const now = new Date();
  return clips.filter((clip) => {
    const clipCreatedAt = new Date(clip.createdAt || TEMP_TIMESTAMP);
    const daysDifference = Math.floor(
      (now.getTime() - clipCreatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (timeframe) {
      case "1day":
        return daysDifference < 1;
      case "1week":
        return daysDifference < 7;
      case "1month":
        return daysDifference < 30;
      default:
        return true;
    }
  });
};

/**
 * Filters an array of clips by specified member IDs.
 * @param {Clip[]} clips - The array of clips to filter.
 * @param {number[]} memberIds - The array of member IDs to filter by.
 * @returns {Clip[]} - An array of filtered clips.
 */
const filterByMemberIds = (clips: Clip[], memberIds: number[]): Clip[] => {
  if (memberIds.length === 0) return clips;

  if (clips.at(0)?.platform !== "twitch") {
    return filterClips(clips, memberIds);
  } else {
    return clips.filter((clip) =>
      memberIds.includes(
        members.filter((m) => m.twitchChannelId === clip.channelId).at(0)?.id ??
          0,
      ),
    );
  }
};

const filterByKeyword = (clips: Clip[], keyword: string): Clip[] => {
  if (!keyword.trim()) return clips;

  const lowercasedKeyword = keyword.toLowerCase();
  return clips.filter(
    (clip) =>
      clip.title.toLowerCase().includes(lowercasedKeyword) ||
      clip.description.toLowerCase().includes(lowercasedKeyword),
  );
};

export const applyFilters = (
  clips: Clip[],
  searchClipTimeframe: Timeframe | null,
  searchMemberIds: number[],
  searchKeyword: string,
): Clip[] => {
  let filteredClips = [...clips];

  filteredClips = filterByTimeframe(filteredClips, searchClipTimeframe);
  filteredClips = filterByMemberIds(filteredClips, searchMemberIds);
  filteredClips = filterByKeyword(filteredClips, searchKeyword);

  return filteredClips;
};

const TRENDING_THRESHOLDS = [
  { days: 1, viewCount: 500 },
  { days: 2, viewCount: 750 },
  { days: 3, viewCount: 1250 },
  { days: 4, viewCount: 1750 },
  { days: 5, viewCount: 2250 },
  { days: 6, viewCount: 3250 },
  { days: 7, viewCount: 5000 },
];
const TWITCH_TRENDING_THRESHOLDS = 500;
const YOUTUBE_TRENDING_THRESHOLDS = 30_000;
export const isTrending = (clip: Clip) => {
  if (!clip.createdAt) return false;

  const createdAt = new Date(clip.createdAt);
  const viewCount = Number(clip.viewCount);

  const isOlderThan = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return createdAt > date;
  };

  return TRENDING_THRESHOLDS.some(({ days }) => {
    const trendThreshold =
      clip.platform === Platform.YouTube
        ? YOUTUBE_TRENDING_THRESHOLDS * days
        : TWITCH_TRENDING_THRESHOLDS * days * 1.25;
    return isOlderThan(days) && viewCount >= trendThreshold;
  });
};

export const getColor = (tag: string) => {
  switch (tag) {
    case "新機能追加":
      return "primary";
    case "バグ修正":
      return "secondary";

    default:
      return "default";
  }
};

export const pathNames: { [key: string]: string } = {
  notifications: "お知らせ",
  contact: "お問い合わせ",
  about: "このサイトについて",
  terms: "利用規約",
  privacy: "プライバシーポリシー",
  signup: "新規登録",
};

export const groupEventsByYearMonth = (events: VspoEvent[]) => {
  const eventsByMonth: { [key: string]: VspoEvent[] } = {};

  for (const event of events) {
    const eventDate = new Date(event.startedAt);
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth() + 1;

    // キーを 'yyyy-mm' の形式で生成
    const key = `${year}-${month.toString().padStart(2, "0")}`;

    if (!eventsByMonth[key]) {
      eventsByMonth[key] = [];
    }

    eventsByMonth[key].push(event);
  }

  return Object.entries(eventsByMonth)
    .sort(([keyA], [keyB]) => (keyA > keyB ? 1 : -1))
    .reduce(
      (sortedObj, [key, value]) => {
        sortedObj[key] = value;
        return sortedObj;
      },
      {} as { [key: string]: VspoEvent[] },
    );
};

type HasThumbnailUrl = { thumbnailUrl: string };

export const convertThumbnailQualityInObjects = <T extends HasThumbnailUrl>(
  objects: T[],
): T[] => {
  return objects.map((object) => ({
    ...object,
    thumbnailUrl: object.thumbnailUrl
      .replace("http://", "https://")
      .replace("%{width}", "320")
      .replace("%{height}", "180")
      .replace("-{width}x{height}", "-320x180"),
    // .replace("hqdefault", "mqdefault")
  }));
};

export const isValidDate = (dateString: string) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
};
