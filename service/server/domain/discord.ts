import type { DiscordEmbed } from "@discordeno/types";
import { EmbedsBuilder } from "@discordeno/utils";
import { z } from "zod";
import { StatusSchema, type Video } from "./video";

export const discordChannel = z.object({
  id: z.string(),
  rawId: z.string(),
  serverId: z.string(),
  name: z.string(),
  languageCode: z.string().optional().default("default"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const discordChannels = z.array(discordChannel);

export const discordServer = z.object({
  id: z.string(),
  rawId: z.string(),
  name: z.string(),
  languageCode: z.string().optional().default("default"),
  discordChannels: discordChannels,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const discordServers = z.array(discordServer);

export const discordMessage = z.object({
  id: z.string(),
  type: z.enum(["bot", "admin"]),
  rawId: z.string(),
  channelId: z.string(),
  content: z.string(),
  embedVideos: z.array(
    z.object({
      identifier: z.string(),
      title: z.string(),
      url: z.string(),
      thumbnail: z.string(),
      startedAt: z.string(),
      status: StatusSchema,
    }),
  ),
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

export function createVideoEmbed(video: Video): DiscordEmbed {
  const embeds = new EmbedsBuilder()
    .newEmbed()
    .setTitle(video.title, video.link)
    .setColor(video.statusColor)
    .addField("配信日時/Streaming Date", video.formattedStartedAt, true)
    .setImage(video.thumbnailURL)
    .setAuthor(video.creatorName || "Unknown", {
      icon_url: video.creatorThumbnailURL || "",
    })
    .setFooter(`${video.platform} Powered by Spodule`, {
      icon_url: video.platformIconURL,
    });

  embeds.validate();

  return embeds[0];
}
