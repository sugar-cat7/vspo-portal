import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Channel, Video } from "../../domain";
import {
  type TestCase,
  mockYoutubeClient,
  mockYoutubeResponses,
} from "../../test/mock/youtube";
import { YoutubeService, query } from "./index";

type QueryEventType = "completed" | "live" | "upcoming";

describe("YoutubeService", () => {
  let youtubeService: YoutubeService;

  beforeEach(() => {
    vi.mock("googleapis", () => ({
      google: {
        youtube: vi.fn().mockImplementation(() => mockYoutubeClient),
      },
    }));
    youtubeService = new YoutubeService("dummy_api_key");
    vi.clearAllMocks();
  });

  describe("getVideos", () => {
    const testCases: TestCase<{ videoIds: string[] }>[] = [
      {
        name: "should fetch videos by IDs successfully",
        videoIds: ["archive_video_id"],
        mockResponses: [mockYoutubeResponses.validVideos],
        expectedResult: {
          rawId: "archive_video_id",
          rawChannelID: "channel_id_1",
          title: "Archived Stream",
          description: "This is an archived stream",
          platform: "youtube",
          status: "ended",
          viewCount: 10000,
          tags: ["gaming", "archive"],
          languageCode: "default",
          platformIconURL:
            "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/server/assets/icon/youtube.png",
          link: "https://www.youtube.com/watch?v=archive_video_id",
          statusColor: 255, // Blue for ended
          startedAt: "2024-01-01T00:00:00Z",
          endedAt: "2024-01-01T02:00:00Z",
        },
      },
      {
        name: "should handle API error",
        videoIds: ["invalid_id"],
        mockResponses: [mockYoutubeResponses.invalidRequest],
        expectedError: "Network error while fetching videos",
      },
      {
        name: "should handle network error",
        videoIds: ["error"],
        mockResponses: [mockYoutubeResponses.networkError],
        expectedError: "Network error",
      },
    ];

    it.concurrent.each(testCases)(
      "$name",
      async ({ videoIds, expectedError, expectedResult }) => {
        const result = await youtubeService.getVideos({ videoIds });

        if (expectedError) {
          expect(result.err).toBeDefined();
          expect(result.err?.message).toContain(expectedError);
          return;
        }

        expect(result.err).toBeUndefined();
        if (result.err || !expectedResult) return;

        const videos = result.val;
        expect(videos).toHaveLength(1);
        const video = videos[0];
        expect(video).toMatchObject(expectedResult);
      },
    );
  });

  describe("searchVideos", () => {
    const testCases: TestCase<{
      query: typeof query.VSPO_JP;
      eventType: QueryEventType;
    }>[] = [
      {
        name: "should search live videos successfully",
        query: query.VSPO_JP,
        eventType: "live",
        mockResponses: [mockYoutubeResponses.validSearchResults],
        expectedResult: {
          rawId: "live_video_id",
          status: "live",
          title: "🔴 Live Gaming Stream",
          platform: "youtube",
          languageCode: "default",
          statusColor: 16711680, // Red for live
          link: "https://www.youtube.com/watch?v=live_video_id",
        },
      },
      {
        name: "should handle API error",
        query: "invalid" as typeof query.VSPO_JP,
        eventType: "live",
        mockResponses: [mockYoutubeResponses.invalidRequest],
        expectedError: "Network error while searching videos",
      },
    ];

    it.concurrent.each(testCases)(
      "$name",
      async ({ query, eventType, expectedError, expectedResult }) => {
        const result = await youtubeService.searchVideos({ query, eventType });

        if (expectedError) {
          expect(result.err).toBeDefined();
          expect(result.err?.message).toContain(expectedError);
          return;
        }

        expect(result.err).toBeUndefined();
        if (result.err || !expectedResult) return;

        const videos = result.val;
        expect(videos).toHaveLength(1);
        const video = videos[0];
        expect(video).toMatchObject(expectedResult);
      },
    );
  });

  describe("getChannels", () => {
    const testCases: TestCase<{ channelIds: string[] }>[] = [
      {
        name: "should fetch channels by IDs successfully",
        channelIds: ["channel_id_1"],
        mockResponses: [mockYoutubeResponses.validChannels],
        expectedResult: {
          id: "channel_id_1",
          creatorID: "",
          youtube: {
            rawId: "channel_id_1",
            name: "Gaming Channel",
            description: "Main gaming channel",
            thumbnailURL: expect.stringContaining("example.com"),
            publishedAt: "2023-01-01T00:00:00Z",
            subscriberCount: 0,
          },
          twitch: null,
          twitCasting: null,
          niconico: null,
        } as Channel,
      },
      {
        name: "should handle API error",
        channelIds: ["invalid_id"],
        mockResponses: [mockYoutubeResponses.invalidRequest],
        expectedError: "Network error while fetching channels",
      },
    ];

    it.concurrent.each(testCases)(
      "$name",
      async ({ channelIds, expectedError, expectedResult }) => {
        const result = await youtubeService.getChannels({ channelIds });

        if (expectedError) {
          expect(result.err).toBeDefined();
          expect(result.err?.message).toContain(expectedError);
          return;
        }

        expect(result.err).toBeUndefined();
        if (result.err || !expectedResult) return;

        const channels = result.val;
        expect(channels).toHaveLength(1);
        const channel = channels[0];
        expect(channel).toMatchObject(expectedResult);
      },
    );
  });
});
