export type Member = {
  id: number;
  name: string;
  keywords: string[];
  channelId: string;
  iconUrl: string;
  twitchChannelId?: string;
  twitchChannelUserName?: string;
  twitchIconUrl?: string;
  twitcastingScreenId?: string;
  twitcastingUserId?: string;
};
