export enum LiveStatus {
  Archive = "archive",
  Live = "live",
  Upcoming = "upcoming",
}

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
