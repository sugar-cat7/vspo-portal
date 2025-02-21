import { beforeEach, describe, expect, it } from "vitest";
import {
  type TestCase,
  mockTwitcastingResponses,
} from "../../test/mock/twitcasting";
import { TwitcastingService } from "./index";

describe("TwitcastingService", () => {
  let twitcastingService: TwitcastingService;

  beforeEach(() => {
    twitcastingService = new TwitcastingService("dummy_token");
  });

  describe("getVideos", () => {
    const testCases: TestCase<{ userIds: string[] }>[] = [
      {
        name: "should fetch videos successfully",
        userIds: ["user_id_1"],
        mockResponses: [mockTwitcastingResponses.validMovies],
        expectedResult: {
          rawId: "movie_id_1",
          rawChannelID: "user_id_1",
          title: "🔴 Live Stream",
          platform: "twitcasting",
          status: "live",
          viewCount: 1000,
          tags: [],
          languageCode: "default",
          platformIconURL:
            "https://raw.githubusercontent.com/sugar-cat7/vspo-portal/main/service/server/assets/icon/twitcasting.png",
          link: "https://twitcasting.tv/user_id_1/movie/movie_id_1",
          statusColor: 16711680, // Red for live
          startedAt: new Date(1704067200 * 1000).toISOString(), // Convert UNIX timestamp
          endedAt: null,
        },
      },
      {
        name: "should handle API error - invalid token",
        userIds: ["invalid"],
        mockResponses: [mockTwitcastingResponses.invalidToken],
        expectedError:
          "Failed to fetch videos for user invalid: 401 Unauthorized",
      },
      {
        name: "should handle network error",
        userIds: ["error"],
        mockResponses: [mockTwitcastingResponses.networkError],
        expectedError: "Network error while fetching videos for user error",
      },
      {
        name: "should handle invalid response format",
        userIds: ["invalid_response"],
        mockResponses: [mockTwitcastingResponses.invalidResponse],
        expectedError:
          "Failed to fetch videos for user invalid_response: 400 Bad Request",
      },
    ];

    it.concurrent.each(testCases)(
      "$name",
      async ({ userIds, expectedError, expectedResult }) => {
        const result = await twitcastingService.getVideos({ userIds });

        if (expectedError) {
          expect(result.err).toBeDefined();
          expect(result.err?.message).toContain(expectedError);
          return;
        }

        expect(result.err).toBeUndefined();
        if (result.err || !expectedResult) return;

        const videos = result.val;
        expect(videos).toHaveLength(2); // 2 videos in mock response
        const video = videos[0]; // Test first video (live)
        expect(video).toMatchObject(expectedResult);

        // Test second video (ended)
        const endedVideo = videos[1];
        expect(endedVideo).toMatchObject({
          rawId: "movie_id_2",
          rawChannelID: "user_id_1",
          title: "Past Stream",
          platform: "twitcasting",
          status: "ended",
          viewCount: 5000,
          startedAt: new Date(1704153600 * 1000).toISOString(), // Convert UNIX timestamp
        });
      },
    );
  });
});
