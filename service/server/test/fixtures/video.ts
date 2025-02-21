import { type Channel, createChannel } from "../../domain/channel";
import { createCreator } from "../../domain/creator";
import {
  type VideoInput,
  type Videos,
  createVideo,
  createVideos,
} from "../../domain/video";
import type { InsertCreator } from "../../infra/repository/schema";
import { assertNonNullProperty } from "../utils/assert";

export const testCreator = {
  id: "creator-1",
  memberType: "vspo_jp",
  representativeThumbnailUrl: "https://example.com/creator-thumbnail.jpg",
  updatedAt: new Date(),
};

const channelData = {
  id: "channel-1",
  creatorID: testCreator.id,
  youtube: {
    rawId: "test-channel-1",
    name: "Test Channel",
    description: "Test Channel Description",
    thumbnailURL: "https://example.com/channel-thumbnail.jpg",
    publishedAt: new Date().toISOString(),
    subscriberCount: 1000,
  },
  twitch: null,
  twitCasting: null,
  niconico: null,
} as const;

export const testChannel = createChannel(channelData);

export const createTestVideo = (
  overrides: Partial<VideoInput> = {},
): VideoInput => ({
  id: "test-video-1",
  rawId: "test-video-1",
  rawChannelID: assertNonNullProperty(channelData, "youtube").rawId,
  title: "Test Video 1",
  description: "Test Description 1",
  publishedAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
  endedAt: new Date().toISOString(),
  platform: "youtube",
  status: "live",
  tags: ["test", "video"],
  viewCount: 0,
  thumbnailURL: "https://example.com/thumbnail1.jpg",
  videoType: "vspo_stream",
  creatorName: "Test Creator",
  creatorThumbnailURL: "https://example.com/creator-thumbnail.jpg",
  languageCode: "ja",
  ...overrides,
});

export const testVideo = createVideo(createTestVideo());
export const testVideos = createVideos([createTestVideo()]);
