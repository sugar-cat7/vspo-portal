import { ServerResponse } from "http";
import { ParsedUrlQuery } from "querystring";
import { platforms } from "@/constants/platforms";
import { freechatVideoIds } from "@/data/freechat-video-ids";
import { members } from "@/data/members";
import { VspoEvent } from "@/types/events";
import { Member } from "@/types/member";
import { SiteNewsTag } from "@/types/site-news";
import {
  Clip,
  LiveStatus,
  Livestream,
  Platform,
  PlatformWithChat,
  Video,
} from "@/types/streaming";
import { Timeframe } from "@/types/timeframe";
import { Locale, getHours, isMatch } from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { enUS, ja, ko, zhCN, zhTW } from "date-fns/locale";
import { createInstance as createI18nInstance } from "i18next";
import { SSRConfig } from "next-i18next";
import { DEFAULT_LOCALE, TEMP_TIMESTAMP, TIME_ZONE_COOKIE } from "./Const";
import { convertToUTCDate, getCurrentUTCDate } from "./dayjs";

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

/**
 * Determines whether a video is a livestream.
 * @param video - The video to perform the check on.
 * @returns true if the video is a livestream, false otherwise (if it is a clip).
 */
export const isLivestream = (video: Video): video is Livestream => {
  return "actualEndTime" in video;
};

/**
 * Determines whether a livestream is on a platform which has embeddable chat.
 * @param livestream - The livestream to perform the check on.
 * @returns true if the livestream is on a platform which has embeddable chat, false otherwise.
 */
export const isOnPlatformWithChat = (
  livestream: Livestream,
): livestream is Livestream & { platform: PlatformWithChat } => {
  return livestream.platform === "twitch" || livestream.platform === "youtube";
};

const supportedPlatforms = platforms.map((platform) => platform.id);
const unsupportedPlatformErrorMessage = (platform: Platform) => {
  return `Unsupported platform: ${platform}. Supported platforms are: ${supportedPlatforms.join(
    ", ",
  )}`;
};

/**
 * Gets the URL for a video.
 * @param video - The video to generate the URL for.
 * @returns The URL for the video.
 */
export const getVideoUrl = (video: Video) =>
  isLivestream(video) ? getLivestreamUrl(video) : getClipUrl(video);

const getLivestreamUrl = ({
  id,
  platform,
  link,
  channelTitle,
  twitchName,
  twitchPastVideoId,
  isTemp,
  tempUrl,
}: Livestream) => {
  if (isTemp && tempUrl) {
    return tempUrl;
  }
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${id}`;
    case "twitch":
      return twitchPastVideoId
        ? `https://www.twitch.tv/videos/${twitchPastVideoId}`
        : `https://www.twitch.tv/${twitchName!}`;
    case "twitcasting": {
      if (link?.includes("movie")) {
        return link;
      }
      const member = members.find((m) => m.name === channelTitle);
      return member?.twitcastingScreenId
        ? `https://twitcasting.tv/${member.twitcastingScreenId}/movie/${id}`
        : "";
    }
    case "nicovideo":
      return `https://live.nicovideo.jp/watch/${id}`;
    default:
      throw new Error(unsupportedPlatformErrorMessage(platform));
  }
};

const getClipUrl = ({ id, platform, link }: Clip) => {
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${id}`;
    case "twitch":
      return link;
    default:
      throw new Error(unsupportedPlatformErrorMessage(platform));
  }
};

/**
 * Gets the embed URL for a video.
 * Requires access to the document object.
 * @param video - The video to generate the embed URL for.
 * @returns The embed URL for the video.
 */
export const getVideoEmbedUrl = (video: Video) =>
  isLivestream(video) ? getLivestreamEmbedUrl(video) : getClipEmbedUrl(video);

const getLivestreamEmbedUrl = (livestream: Livestream) => {
  switch (livestream.platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${livestream.id}`;
    case "twitch": {
      const tid = livestream.twitchPastVideoId
        ? `video=${livestream.twitchPastVideoId}`
        : `channel=${livestream.twitchName!}`;
      return `https://player.twitch.tv/?${tid}&parent=${document.location.hostname}&autoplay=false`;
    }
    case "twitcasting":
      return getLivestreamUrl(livestream);
    case "nicovideo":
      return `https://live.nicovideo.jp/embed/${livestream.id}`;
    default:
      throw new Error(unsupportedPlatformErrorMessage(livestream.platform));
  }
};

const getClipEmbedUrl = ({ id, platform }: Clip) => {
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${id}`;
    case "twitch":
      return `https://clips.twitch.tv/embed?clip=${id}&parent=${document.location.hostname}&autoplay=false`;
    default:
      throw new Error(unsupportedPlatformErrorMessage(platform));
  }
};

/**
 * Gets the chat embed URL for the livestream in the given color scheme.
 * Requires access to the document object.
 * @param livestream - The livestream to generate the chat embed URL for.
 * @param isDarkMode - Whether the chat embed should use dark mode.
 * @returns The chat embed URL for the livestream in the given color scheme.
 */
export const getChatEmbedUrl = (
  livestream: Livestream & { platform: PlatformWithChat },
  isDarkMode: boolean,
) => {
  const domain = document.location.hostname;
  if (livestream.platform === "twitch") {
    const chatEmbedUrl = `https://www.twitch.tv/embed/${livestream.twitchName!}/chat?parent=${domain}`;
    return isDarkMode ? `${chatEmbedUrl}&darkpopout` : chatEmbedUrl;
  }
  const chatEmbedUrl = `https://www.youtube.com/live_chat?v=${livestream.id}&embed_domain=${domain}`;
  return isDarkMode ? `${chatEmbedUrl}&dark_theme=1` : chatEmbedUrl;
};

/**
 * Gets the icon URL for a video.
 * @param video - The video to generate the icon URL for.
 * @returns The icon URL for the video.
 */
export const getVideoIconUrl = (video: Video) => {
  if (!isLivestream(video) && video.platform === "twitch") {
    const member = members.find((m) => m.twitchChannelId === video.channelId);
    return member?.iconUrl;
  }
  return video.iconUrl;
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
 * Get a range of one week ago and one week later, without considering the time.
 * @returns - An object with `oneWeekAgo` and `oneWeekLater` properties representing the dates.
 */
export const getOneWeekRange = () => {
  const now = getCurrentUTCDate();
  now.setHours(0, 0, 0, 0); // Set time to 00:00:00

  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

  const oneWeekAgo = convertToUTCDate(now.getTime() - oneWeekInMilliseconds);
  const oneWeekLater = convertToUTCDate(now.getTime() + oneWeekInMilliseconds);

  return {
    oneWeekAgo,
    oneWeekLater,
  };
};

const locales: Record<string, Locale> = {
  en: enUS,
  ja: ja,
  cn: zhCN,
  tw: zhTW,
  ko: ko,
};

/**
 * Format a date with the given format, locale, and time zone.
 * @param date - The Date object, date string, or timestamp to format.
 * @param dateFormat - The date format pattern to use for formatting.
 * @param localeCode - The code identifying the locale to use for formatting.
 * @param timeZone - The time zone to use for formatting.
 * @returns A formatted date string.
 */
export const formatDate = (
  date: Date | number | string,
  dateFormat: string,
  {
    localeCode = DEFAULT_LOCALE,
    timeZone = "UTC",
  }: { localeCode?: string; timeZone?: string } = {},
): string => {
  const locale = locales[localeCode] ?? enUS;
  return formatInTimeZone(convertToUTCDate(date), timeZone, dateFormat, {
    locale,
  });
};

/**
 * Determines whether a date string matches a specific date format.
 * @param dateString - The date string to test.
 * @param dateFormat - The date format pattern to test the string against.
 * @returns True if the date string conforms to the date format, else false.
 */
export const matchesDateFormat = (dateString: string, dateFormat: string) => {
  return isMatch(dateString, dateFormat);
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
  if (freechatVideoIds.includes(livestream.id)) {
    return "freechat";
  }

  const scheduledStartTime: Date = convertToUTCDate(
    livestream.scheduledStartTime,
  );
  const currentTime: Date = getCurrentUTCDate();

  // 時間差をミリ秒で計算
  const timeDifference: number = Math.abs(
    scheduledStartTime.getTime() - currentTime.getTime(),
  );

  // 12時間をミリ秒で表す
  const twelveHoursInMilliseconds: number = 12 * 60 * 60 * 1000;

  // 時間差が12時間以内であるかどうかを判断
  const isWithinTwelveHours: boolean =
    timeDifference <= twelveHoursInMilliseconds;
  if (convertToUTCDate(livestream.scheduledStartTime) > getCurrentUTCDate()) {
    return "upcoming";
  } else if (
    livestream.actualEndTime &&
    livestream.actualEndTime.includes("1998-01-01") &&
    isWithinTwelveHours
  ) {
    return "live";
  } else {
    return "archive";
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
 * @param {string} timeZone - The time zone to use for time comparison.
 * @returns {Array<{label: string, livestreams: Livestream[]}>} - An array of objects containing a label and an array of livestreams.
 */
export const groupLivestreamsByTimeRange = (
  livestreams: Livestream[],
  timeZone: string,
) => {
  return timeRanges.map((timeRange) => {
    return {
      label: timeRange.label,
      livestreams: livestreams.filter((livestream) => {
        const zonedStartTime = utcToZonedTime(
          livestream.scheduledStartTime,
          timeZone,
        );
        const hours = getHours(zonedStartTime);
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

  const now = getCurrentUTCDate();
  return clips.filter((clip) => {
    const clipCreatedAt = convertToUTCDate(clip.createdAt || TEMP_TIMESTAMP);
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

  const createdAt = convertToUTCDate(clip.createdAt);
  const viewCount = Number(clip.viewCount);

  const isOlderThan = (days: number) => {
    const date = getCurrentUTCDate();
    date.setDate(date.getDate() - days);
    return createdAt > date;
  };

  return TRENDING_THRESHOLDS.some(({ days }) => {
    const trendThreshold =
      clip.platform === "youtube"
        ? YOUTUBE_TRENDING_THRESHOLDS * days
        : TWITCH_TRENDING_THRESHOLDS * days * 1.25;
    return isOlderThan(days) && viewCount >= trendThreshold;
  });
};

export const getSiteNewsTagColor = (tag: SiteNewsTag) => {
  switch (tag) {
    case "feat":
      return "primary";
    case "fix":
      return "secondary";
    default:
      return "default";
  }
};

export const groupEventsByYearMonth = (events: VspoEvent[]) => {
  const eventsByMonth = groupBy(events, (event) =>
    formatDate(event.startedAt, "yyyy-MM"),
  );

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

/**
 * Searches for members who are relevant to the given string.
 * @param str - The string to search through.
 * @returns The list of relevant members.
 */
export const getRelevantMembers = (str: string) => {
  return members.filter((member) => isRelevantMember(member, str));
};

/**
 * Determines whether the given member is relevant to the given string.
 * @param member - The query member.
 * @param str - The string to search through.
 * @returns true if the member is relevant to the string, false otherwise.
 */
export const isRelevantMember = (member: Member, str: string) => {
  return member.keywords.some((keyword) => str.includes(keyword));
};

type HasThumbnailUrl = { thumbnailUrl: string };

export const convertThumbnailQualityInObjects = <T extends HasThumbnailUrl>(
  objects: T[],
): T[] => {
  if (!Array.isArray(objects)) {
    return objects;
  }
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
  const d = convertToUTCDate(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
};

export const dateStringOffSet = (dateString: string) => {
  const date = convertToUTCDate(dateString);
  const offset = date.getTimezoneOffset();
  return offset;
};

/**
 * Generates a path for each of the given paths in each of the given locales.
 * Use for generating paths for each locale in `getStaticPaths`.
 * @param paths - The paths to generated for each locale.
 * @param locales - The locales in which this page should be generated.
 * @returns The given paths in each of the given locales.
 */
export const generateStaticPathsForLocales = <
  Params extends ParsedUrlQuery = ParsedUrlQuery,
>(
  paths: { params: Params }[],
  locales: string[] | undefined,
) => {
  if (locales === undefined || locales.length === 0) {
    return paths;
  }
  return paths.flatMap((path) => {
    return locales.map((locale) => ({
      ...path,
      locale,
    }));
  });
};

/**
 * Gets an initialized i18n instance created from the config object given by
 * `serverSideTranslations`.
 * Enables translations to be used in `getStaticProps`.
 * @param translations - The object obtained from `serverSideTranslations`.
 * @returns An initialized i18n instance.
 */
export const getInitializedI18nInstance = (
  translations: SSRConfig,
  defaultNamespace?: string,
) => {
  const { _nextI18Next: nextI18Next } = translations;
  const i18n = createI18nInstance({
    ...nextI18Next?.userConfig,
    lng: nextI18Next?.initialLocale,
    ns: nextI18Next?.ns,
    defaultNS: defaultNamespace ?? false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    resources: nextI18Next?.initialI18nStore,
  });
  i18n.init();
  return i18n;
};

/**
 * Gets the value of the cookie with the given `cookieName` found in `str`.
 * @param cookieName - The name of the desired cookie.
 * @param str - The string to search for the cookie in, e.g. `document.cookie`.
 * @returns The value of the cookie with the given name, or
 * undefined if no such cookie found in `str`.
 */
export const getCookieValue = (cookieName: string, str: string) => {
  for (const maybeCookie of str.split(";")) {
    const parts = maybeCookie.trim().split("=");
    if (parts[0] === cookieName && parts.length >= 2) {
      const value = parts.slice(1).join("=");
      return decodeURIComponent(value);
    }
  }
  return undefined;
};

/**
 * Gets the time zone contained in the given response's set-cookie header.
 * @param res - The server response object containing the header.
 * @returns The value of the time zone in the set-cookie header, or
 * undefined if the set-cookie header does not set a time zone.
 */
export const getSetCookieTimeZone = (res: ServerResponse) => {
  const setCookieHeader = res.getHeader("set-cookie");
  if (setCookieHeader === undefined || typeof setCookieHeader === "number") {
    return undefined;
  }
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];
  for (const cookie of cookies) {
    const cookieValue = getCookieValue(TIME_ZONE_COOKIE, cookie);
    if (cookieValue !== undefined) {
      return cookieValue;
    }
  }
  return undefined;
};
