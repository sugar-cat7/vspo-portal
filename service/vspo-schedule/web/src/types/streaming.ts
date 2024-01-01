export type Thumbnail = {
  url: string;
  width: number;
  height: number;
};

export type Thumbnails = {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
};

export type Snippet = {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
};

export type SearchResult = {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: Snippet;
};

export type SearchListResponse = {
  kind: string;
  etag: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: SearchResult[];
};

export enum Platform {
  YouTube = "youtube",
  Twitch = "twitch",
  TwitCasting = "twitcasting",
  NicoNico = "nicovideo",
}

export type Livestream = {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  scheduledStartTime: string;
  actualEndTime?: string;
  iconUrl: string;
  platform: Platform;
  link?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  twitchName?: string;
  createdAt?: string;
  twitchPastVideoId?: string;
  isTemp?: boolean;
  tempUrl?: string;
};

export type YoutubeItem = {
  id: string;
  liveStreamingDetails: {
    actualStartTime: string;
    actualEndTime?: string;
    scheduledStartTime: string;
  };
};

export type LivestreamResponse = {
  livestreams: Livestream[];
};

export type FormatOptions = {
  dateFormat: string;
  locale?: string;
};

export type Clip = {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  platform: Platform;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  createdAt?: string;
  link?: string;
  iconUrl?: string;
  scheduledStartTime?: string;
  isTemp?: boolean;
  tempUrl?: string;
};
export type MemberKeyword = {
  id: number;
  name: string;
  keywords: string[];
};

export type ArticleData = {
  link: string;
  publishedAt: string;
  updated?: boolean;
};

export type ArticleSummary = {
  startedAt: string;
  title: string;
  contentSummary: string;
  webPageLinks: string[];
  tweetLinks: string[];
  newsId: string;
};
