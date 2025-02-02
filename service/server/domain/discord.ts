import { z } from "zod";

export const discordChannel = z.object({
  id: z.string(),
  rawId: z.string(),
  serverId: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const discordChannels = z.array(discordChannel);

export const discordServer = z.object({
  id: z.string(),
  rawId: z.string(),
  botMessageChannelIds: z.array(z.string()),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const discordServers = z.array(discordServer);

export const discordMessage = z.object({
  id: z.string(),
  type: z.enum(["bot", "admin"]),
  rawId: z.string(),
  channelId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const discordMessages = z.array(discordMessage);

export type DiscordChannel = z.infer<typeof discordChannel>;
export type DiscordChannels = z.infer<typeof discordChannels>;
export type DiscordServer = z.infer<typeof discordServer>;
export type DiscordServers = z.infer<typeof discordServers>;
export type DiscordMessage = z.infer<typeof discordMessage>;
export type DiscordMessages = z.infer<typeof discordMessages>;

export const createDiscordChannel = (
  discordChannel: DiscordChannel,
): DiscordChannel => {
  return discordChannel;
};

export const createDiscordChannels = (
  discordChannels: DiscordChannels,
): DiscordChannels => {
  return discordChannels;
};

export const createDiscordServer = (
  discordServer: DiscordServer,
): DiscordServer => {
  return discordServer;
};

export const createDiscordServers = (
  discordServers: DiscordServers,
): DiscordServers => {
  return discordServers;
};

export const createDiscordMessage = (
  discordMessage: DiscordMessage,
): DiscordMessage => {
  return discordMessage;
};

export const createDiscordMessages = (
  discordMessages: DiscordMessages,
): DiscordMessages => {
  return discordMessages;
};
