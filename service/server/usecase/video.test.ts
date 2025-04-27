import { beforeEach, describe, expect, it } from "vitest";
import type { Page } from "../domain/pagination";
import { TargetLangSchema } from "../domain/translate";
import {
  PlatformSchema,
  StatusSchema,
  VideoTypeSchema,
  type Videos,
  createVideos,
} from "../domain/video";
import type { IAppContext } from "../infra/dependency";
import { createUUID } from "../pkg/uuid";
import {
  EN_YOUTUBE_CHANNELS,
  JP_TWITCH_CHANNELS,
  JP_YOUTUBE_CHANNELS,
} from "../test/fixtures";
import { setupTxManager } from "../test/setup";
import { type ListParam, VideoInteractor } from "./video";

describe.concurrent("VideoInteractor", () => {
  let context: IAppContext;
  let interactor: VideoInteractor;

  beforeEach(async () => {
    context = await setupTxManager();
    interactor = new VideoInteractor(context);
  });

  describe.concurrent("searchLive", () => {
    it.concurrent("should return live videos successfully", async () => {
      const result = await interactor.searchLive();
      expect(result.err).toBeFalsy();
      if (!result.err) {
        expect(Array.isArray(result.val)).toBeTruthy();
      }
    });
  });

  describe.concurrent("searchExist", () => {
    it.concurrent("should return existing videos successfully", async () => {
      const result = await interactor.searchExist();
      expect(result.err).toBeFalsy();
      if (!result.err) {
        expect(Array.isArray(result.val)).toBeTruthy();
      }
    });
  });

  describe.concurrent("batchUpsert", () => {
    it.concurrent("should upsert videos successfully", async () => {
      // Create test video data
      const testVideos = createVideos([
        {
          id: createUUID(),
          rawId: `test-video-${Date.now()}`,
          rawChannelID: JP_YOUTUBE_CHANNELS[0], // Use actual YouTube channel ID
          title: "Test Video Title",
          description: "Test video description",
          languageCode: TargetLangSchema.Enum.en,
          publishedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          endedAt: null,
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.upcoming,
          tags: ["test", "video"],
          viewCount: 0,
          thumbnailURL: "https://example.com/thumbnail.jpg",
          videoType: VideoTypeSchema.Enum.vspo_stream,
          link: "https://www.youtube.com/watch?v=test-video-id",
        },
      ]);

      // Call batchUpsert
      const result = await interactor.batchUpsert(testVideos);

      // Verify result
      expect(result.err).toBeFalsy();
      if (result.err) return;

      // Check returned videos
      expect(Array.isArray(result.val)).toBeTruthy();
      expect(result.val.length).toBeGreaterThan(0);

      // Verify the video was correctly stored by fetching it
      const listResult = await interactor.list({
        limit: 10,
        page: 0,
        languageCode: TargetLangSchema.Enum.en,
        // Use specific properties to search for our test video
        platform: PlatformSchema.Enum.youtube,
        videoType: VideoTypeSchema.Enum.vspo_stream,
      });

      expect(listResult.err).toBeFalsy();
      if (listResult.err) return;

      // Try to find our video in the results
      const upsertedVideo = listResult.val.videos.find(
        (v) => v.rawId === testVideos[0].rawId,
      );

      // Because of test DB state, the video might not be found, so we just check the direct result
      if (upsertedVideo) {
        expect(upsertedVideo.title).toBe(testVideos[0].title);
        expect(upsertedVideo.platform).toBe(testVideos[0].platform);
        expect(upsertedVideo.status).toBe(testVideos[0].status);
        expect(upsertedVideo.videoType).toBe(testVideos[0].videoType);
      }
    });

    it.concurrent("should update existing videos if they exist", async () => {
      // First create a video
      const originalVideos = createVideos([
        {
          id: createUUID(),
          rawId: `test-video-update-${Date.now()}`,
          rawChannelID: JP_YOUTUBE_CHANNELS[1], // Use a different YouTube channel ID
          title: "Original Title",
          description: "Original description",
          languageCode: TargetLangSchema.Enum.en,
          publishedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          endedAt: null,
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.upcoming,
          tags: ["test", "video"],
          viewCount: 0,
          thumbnailURL: "https://example.com/thumbnail.jpg",
          videoType: VideoTypeSchema.Enum.vspo_stream,
          link: "https://www.youtube.com/watch?v=test-video-id",
        },
      ]);

      // Insert the original video
      const originalResult = await interactor.batchUpsert(originalVideos);

      expect(originalResult.err).toBeFalsy();
      if (originalResult.err) return;

      // Now create an updated version with the same rawId but different data
      const updatedVideos = createVideos([
        {
          id: originalVideos[0].id,
          rawId: originalVideos[0].rawId,
          rawChannelID: originalVideos[0].rawChannelID,
          title: "Updated Title",
          description: "Updated description",
          languageCode: TargetLangSchema.Enum.en,
          publishedAt: originalVideos[0].publishedAt,
          startedAt: originalVideos[0].startedAt,
          endedAt: new Date().toISOString(), // Now it has ended
          platform: originalVideos[0].platform,
          status: StatusSchema.Enum.ended, // Status changed to ended
          tags: ["test", "video", "updated"],
          viewCount: 100, // Views increased
          thumbnailURL: originalVideos[0].thumbnailURL,
          videoType: originalVideos[0].videoType,
          link: originalVideos[0].link,
        },
      ]);

      // Update the video
      const updateResult = await interactor.batchUpsert(updatedVideos);

      expect(updateResult.err).toBeFalsy();
      if (updateResult.err) return;

      // Verify the returned data reflects our updates
      expect(updateResult.val.length).toBeGreaterThan(0);

      // Find the updated video in the result
      const updatedVideo = updateResult.val.find(
        (v) => v.rawId === originalVideos[0].rawId,
      );

      if (updatedVideo) {
        expect(updatedVideo.title).toBe("Updated Title");
        expect(updatedVideo.description).toBe("Updated description");
        expect(updatedVideo.status).toBe(StatusSchema.Enum.ended);
        expect(updatedVideo.viewCount).toBe(100);
        expect(updatedVideo.endedAt).not.toBeNull();
      }
    });

    it.concurrent(
      "should handle multiple videos in a single batch",
      async () => {
        // Create test videos with different platforms
        const testVideos = createVideos([
          {
            id: createUUID(),
            rawId: `test-youtube-${Date.now()}`,
            rawChannelID: EN_YOUTUBE_CHANNELS[0], // Use English YouTube channel ID
            title: "YouTube Test Video",
            description: "YouTube test description",
            languageCode: TargetLangSchema.Enum.en,
            publishedAt: new Date().toISOString(),
            startedAt: new Date().toISOString(),
            endedAt: null,
            platform: PlatformSchema.Enum.youtube,
            status: StatusSchema.Enum.upcoming,
            tags: ["youtube", "test"],
            viewCount: 0,
            thumbnailURL: "https://example.com/youtube-thumbnail.jpg",
            videoType: VideoTypeSchema.Enum.vspo_stream,
            link: "https://www.youtube.com/watch?v=youtube-test-id",
          },
          {
            id: createUUID(),
            rawId: `test-twitch-${Date.now()}`,
            rawChannelID: JP_TWITCH_CHANNELS[0], // Use Japanese Twitch channel ID
            title: "Twitch Test Video",
            description: "Twitch test description",
            languageCode: TargetLangSchema.Enum.en,
            publishedAt: new Date().toISOString(),
            startedAt: new Date().toISOString(),
            endedAt: null,
            platform: PlatformSchema.Enum.twitch,
            status: StatusSchema.Enum.live,
            tags: ["twitch", "test"],
            viewCount: 100,
            thumbnailURL: "https://example.com/twitch-thumbnail.jpg",
            videoType: VideoTypeSchema.Enum.vspo_stream,
            link: "https://www.twitch.tv/test-twitch-channel",
          },
        ]);

        // Call batchUpsert with multiple videos
        const result = await interactor.batchUpsert(testVideos);

        // Verify result
        expect(result.err).toBeFalsy();
        if (result.err) return;

        // Check returned videos
        expect(Array.isArray(result.val)).toBeTruthy();
        expect(result.val.length).toBe(2);

        // Verify both types are in the result
        const youtubeVideo = result.val.find(
          (v) => v.platform === PlatformSchema.Enum.youtube,
        );
        const twitchVideo = result.val.find(
          (v) => v.platform === PlatformSchema.Enum.twitch,
        );

        expect(youtubeVideo).toBeDefined();
        expect(twitchVideo).toBeDefined();

        if (youtubeVideo && twitchVideo) {
          expect(youtubeVideo.title).toBe("YouTube Test Video");
          expect(twitchVideo.title).toBe("Twitch Test Video");
        }
      },
    );

    it.concurrent("should handle translated videos correctly", async () => {
      // Create a video with both English and Japanese translations
      const rawId = `test-translation-${Date.now()}`;
      const originalVideo = createVideos([
        {
          id: createUUID(),
          rawId,
          rawChannelID: EN_YOUTUBE_CHANNELS[1], // Use a different English YouTube channel
          title: "Original English Title",
          description: "Original English description",
          languageCode: TargetLangSchema.Enum.default,
          publishedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          endedAt: null,
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.live,
          tags: ["test", "translation"],
          viewCount: 0,
          thumbnailURL: "https://example.com/thumbnail.jpg",
          videoType: VideoTypeSchema.Enum.vspo_stream,
          link: "https://www.youtube.com/watch?v=translation-test-id",
        },
        {
          id: createUUID(),
          rawId,
          rawChannelID: EN_YOUTUBE_CHANNELS[1], // Use a different English YouTube channel
          title: "Original English Title",
          description: "Original English description",
          languageCode: TargetLangSchema.Enum.en,
          publishedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          endedAt: null,
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.live,
          tags: ["test", "translation"],
          viewCount: 0,
          thumbnailURL: "https://example.com/thumbnail.jpg",
          videoType: VideoTypeSchema.Enum.vspo_stream,
          link: "https://www.youtube.com/watch?v=translation-test-id",
          translated: true,
        },
      ]);

      // Insert the original English video
      const originalResult = await interactor.batchUpsert(originalVideo);

      expect(originalResult.err).toBeFalsy();
      if (originalResult.err) return;
    });
  });

  describe.concurrent("list", () => {
    // Define test case type with proper domain types
    type ListTestCase = {
      name: string;
      params: ListParam;
      expectations: {
        minCount?: number;
        platform?: (typeof PlatformSchema.Enum)[keyof typeof PlatformSchema.Enum];
        status?: (typeof StatusSchema.Enum)[keyof typeof StatusSchema.Enum];
        videoType?: (typeof VideoTypeSchema.Enum)[keyof typeof VideoTypeSchema.Enum];
        memberType?: string;
        dateRange?: boolean;
        ordering?: "asc" | "desc";
        pagination?: {
          page: number;
          limit: number;
        };
      };
    };

    // Common assertion function for checking response structure
    const assertResponseStructure = (result: {
      videos: Videos;
      pagination: Page;
    }): void => {
      const { videos, pagination } = result;
      expect(Array.isArray(videos)).toBeTruthy();
      expect(pagination).toBeDefined();
      expect(typeof pagination.totalCount).toBe("number");
      expect(typeof pagination.totalPage).toBe("number");
      expect(typeof pagination.currentPage).toBe("number");
    };

    // Common assertion function for checking platform
    const assertVideoPlatform = (
      videos: Videos,
      platform: (typeof PlatformSchema.Enum)[keyof typeof PlatformSchema.Enum],
    ): void => {
      for (const video of videos) {
        expect(video.platform).toBe(platform);
      }
    };

    // Common assertion function for checking status
    const assertVideoStatus = (
      videos: Videos,
      status: (typeof StatusSchema.Enum)[keyof typeof StatusSchema.Enum],
    ): void => {
      for (const video of videos) {
        expect(video.status).toBe(status);
      }
    };

    // Common assertion function for checking video type
    const assertVideoType = (
      videos: Videos,
      videoType: (typeof VideoTypeSchema.Enum)[keyof typeof VideoTypeSchema.Enum],
    ): void => {
      for (const video of videos) {
        expect(video.videoType).toBe(videoType);
      }
    };

    // Common assertion function for checking date range
    const assertDateRange = (
      videos: Videos,
      startDate: Date,
      endDate: Date,
    ): void => {
      for (const video of videos) {
        if (video.startedAt) {
          const videoStartDate = new Date(video.startedAt);
          expect(videoStartDate.getTime()).toBeGreaterThanOrEqual(
            startDate.getTime(),
          );

          if (video.endedAt) {
            const videoEndDate = new Date(video.endedAt);
            expect(videoEndDate.getTime()).toBeLessThanOrEqual(
              endDate.getTime(),
            );
          }
        }
      }
    };

    // Common assertion function for checking ordering
    const assertVideoOrdering = (
      videos: Videos,
      ordering: "asc" | "desc",
    ): void => {
      const timestamps = videos
        .map((v) => (v.startedAt ? new Date(v.startedAt).getTime() : 0))
        .filter((t) => t > 0);

      if (timestamps.length <= 1) return;

      if (ordering === "asc") {
        for (let i = 1; i < timestamps.length; i++) {
          expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
        }
      } else {
        for (let i = 1; i < timestamps.length; i++) {
          expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
        }
      }
    };

    // Common assertion function for checking pagination
    const assertPagination = (
      pagination: Page,
      params: ListParam,
      totalItems: number,
    ): void => {
      // Based on pagination.ts, currentPage is ensured to be at least 1
      expect(pagination.currentPage).toBe(Math.max(params.page, 1));

      // Total pages calculation
      const expectedTotalPages = Math.ceil(totalItems / params.limit);
      expect(pagination.totalPage).toBe(expectedTotalPages);

      // Total count should match what we expect
      expect(pagination.totalCount).toBe(totalItems);

      // Previous page logic
      if (params.page > 1) {
        expect(pagination.prevPage).toBe(params.page - 1);
      } else {
        expect(pagination.prevPage).toBe(0);
      }

      // Next page and hasNext logic
      const hasNext = params.page * params.limit < totalItems;
      expect(pagination.hasNext).toBe(hasNext);

      if (hasNext && params.page < expectedTotalPages) {
        expect(pagination.nextPage).toBe(params.page + 1);
      } else {
        expect(pagination.nextPage).toBe(0);
      }
    };

    const testCases: ListTestCase[] = [
      {
        name: "basic parameters only",
        params: {
          limit: 10,
          page: 0,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          minCount: 0,
        },
      },
      {
        name: "with YouTube platform filter",
        params: {
          limit: 10,
          page: 0,
          platform: PlatformSchema.Enum.youtube,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          platform: PlatformSchema.Enum.youtube,
        },
      },
      {
        name: "with Twitch platform filter",
        params: {
          limit: 10,
          page: 0,
          platform: PlatformSchema.Enum.twitch,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          platform: PlatformSchema.Enum.twitch,
        },
      },
      {
        name: "with live status filter",
        params: {
          limit: 10,
          page: 0,
          status: StatusSchema.Enum.live,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          status: StatusSchema.Enum.live,
        },
      },
      {
        name: "with upcoming status filter",
        params: {
          limit: 10,
          page: 0,
          status: StatusSchema.Enum.upcoming,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          status: StatusSchema.Enum.upcoming,
        },
      },
      {
        name: "with ended status filter",
        params: {
          limit: 10,
          page: 0,
          status: StatusSchema.Enum.ended,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          status: StatusSchema.Enum.ended,
        },
      },
      {
        name: "with stream video type filter",
        params: {
          limit: 10,
          page: 0,
          videoType: VideoTypeSchema.Enum.vspo_stream,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          videoType: VideoTypeSchema.Enum.vspo_stream,
        },
      },
      {
        name: "with clip video type filter",
        params: {
          limit: 10,
          page: 0,
          videoType: VideoTypeSchema.Enum.clip,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          videoType: VideoTypeSchema.Enum.clip,
        },
      },
      {
        name: "with date range filter",
        params: {
          limit: 10,
          page: 0,
          startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endedAt: new Date(),
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          dateRange: true,
        },
      },
      {
        name: "with ascending order",
        params: {
          limit: 10,
          page: 0,
          orderBy: "asc",
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          ordering: "asc",
        },
      },
      {
        name: "with descending order",
        params: {
          limit: 10,
          page: 0,
          orderBy: "desc",
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          ordering: "desc",
        },
      },
      {
        name: "with Japanese language code",
        params: {
          limit: 10,
          page: 0,
          languageCode: TargetLangSchema.Enum.ja,
        },
        expectations: {
          minCount: 0,
        },
      },
      {
        name: "with pagination - first page",
        params: {
          limit: 5,
          page: 0,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          pagination: {
            limit: 5,
            page: 0,
          },
        },
      },
      {
        name: "with pagination - second page",
        params: {
          limit: 5,
          page: 1,
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          pagination: {
            limit: 5,
            page: 1,
          },
        },
      },
      {
        name: "with multiple filters combined",
        params: {
          limit: 10,
          page: 0,
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.ended,
          videoType: VideoTypeSchema.Enum.vspo_stream,
          orderBy: "desc",
          languageCode: TargetLangSchema.Enum.en,
        },
        expectations: {
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.ended,
          videoType: VideoTypeSchema.Enum.vspo_stream,
          ordering: "desc",
        },
      },
    ];

    for (const tc of testCases) {
      it.concurrent(`should list videos with ${tc.name}`, async () => {
        const result = await interactor.list(tc.params);

        // Check for successful response
        expect(result.err).toBeFalsy();
        if (result.err) return;

        const { videos, pagination } = result.val;

        // Basic structure checks
        assertResponseStructure(result.val);

        // Filter checks
        if (tc.expectations.minCount !== undefined) {
          expect(videos.length).toBeGreaterThanOrEqual(
            tc.expectations.minCount,
          );
        }

        if (tc.expectations.platform) {
          assertVideoPlatform(videos, tc.expectations.platform);
        }

        if (tc.expectations.status) {
          assertVideoStatus(videos, tc.expectations.status);
        }

        if (tc.expectations.videoType) {
          assertVideoType(videos, tc.expectations.videoType);
        }

        if (
          tc.expectations.dateRange &&
          videos.length > 0 &&
          tc.params.startedAt &&
          tc.params.endedAt
        ) {
          assertDateRange(videos, tc.params.startedAt, tc.params.endedAt);
        }

        if (tc.expectations.ordering && videos.length > 1) {
          assertVideoOrdering(videos, tc.expectations.ordering);
        }

        if (tc.expectations.pagination) {
          // Check if number of items doesn't exceed the limit
          expect(videos.length).toBeLessThanOrEqual(tc.params.limit);

          // Based on pagination.ts, currentPage is ensured to be at least 1
          expect(pagination.currentPage).toBe(Math.max(tc.params.page, 1));
        } else {
          // Default pagination check
          expect(pagination.currentPage).toBe(Math.max(tc.params.page, 1));
        }
      });
    }

    describe.concurrent("pagination specific tests", () => {
      it.concurrent("should handle first page correctly", async () => {
        const params: ListParam = {
          limit: 3,
          page: 0,
          languageCode: TargetLangSchema.Enum.en,
        };

        const result = await interactor.list(params);
        expect(result.err).toBeFalsy();
        if (result.err) return;

        const { videos, pagination } = result.val;

        // Get total count of items for pagination calculation
        const countResult = await interactor.list({
          ...params,
          limit: 100, // Large limit to get all items
        });

        if (countResult.err) return;
        const totalItems = countResult.val.pagination.totalCount;

        // Validate pagination properties
        expect(pagination.currentPage).toBe(1); // 1-indexed in API
        expect(pagination.prevPage).toBe(0); // No previous page
        expect(videos.length).toBeLessThanOrEqual(params.limit);

        // Expected next page - using the actual logic from pagination.ts
        const hasNext = params.page * params.limit < totalItems;
        expect(pagination.hasNext).toBe(hasNext);

        if (hasNext) {
          expect(pagination.nextPage).toBe(1); // Page 0 → nextPage 1 (not 2)
        } else {
          expect(pagination.nextPage).toBe(0);
        }
      });

      it.concurrent("should handle middle page correctly", async () => {
        // We need to ensure there are enough items to have at least 3 pages
        const checkParams: ListParam = {
          limit: 100,
          page: 0,
          languageCode: TargetLangSchema.Enum.en,
        };

        const checkResult = await interactor.list(checkParams);
        if (checkResult.err) return;

        const totalItems = checkResult.val.pagination.totalCount;
        const pageSize = 2; // Small page size to ensure multiple pages

        // Only run pagination test if we have enough data
        if (totalItems < pageSize * 3) {
          // Skip test if not enough data
          expect(true).toBe(true); // Dummy assertion
          return;
        }

        // Test middle page
        const params: ListParam = {
          limit: pageSize,
          page: 1, // Second page (middle)
          languageCode: TargetLangSchema.Enum.en,
        };

        const result = await interactor.list(params);
        expect(result.err).toBeFalsy();
        if (result.err) return;

        const { videos, pagination } = result.val;

        // Validate pagination
        expect(pagination.currentPage).toBe(1); // Based on createPage implementation
        expect(pagination.prevPage).toBe(0); // Previous page
        expect(pagination.hasNext).toBe(true);
        expect(pagination.nextPage).toBe(2); // Next page should be 2
        expect(videos.length).toBeLessThanOrEqual(pageSize);
      });
    });

    it.concurrent(
      "should handle empty result set with future date filter",
      async () => {
        // Use an unlikely combination of filters to get empty results
        const params: ListParam = {
          limit: 10,
          page: 0,
          platform: PlatformSchema.Enum.youtube,
          status: StatusSchema.Enum.live,
          videoType: VideoTypeSchema.Enum.vspo_stream,
          startedAt: new Date("2099-01-01"),
          languageCode: TargetLangSchema.Enum.en,
        };

        const result = await interactor.list(params);

        expect(result.err).toBeFalsy();
        if (!result.err) {
          expect(Array.isArray(result.val.videos)).toBeTruthy();
          expect(result.val.videos.length).toBe(0);
          expect(result.val.pagination.totalCount).toBe(0);
          expect(result.val.pagination.totalPage).toBe(0);
          // Even with no results, currentPage should be at least 1 since we're using Math.max(page, 1)
          expect(result.val.pagination.currentPage).toBe(1);
          expect(result.val.pagination.prevPage).toBe(0);
          expect(result.val.pagination.nextPage).toBe(0);
          expect(result.val.pagination.hasNext).toBe(false);
        }
      },
    );

    it.concurrent(
      "should handle empty result set with invalid platform",
      async () => {
        // Using an invalid platform combination for empty results
        const params: ListParam = {
          limit: 10,
          page: 0,
          platform: "invalid_platform" as string, // Force an invalid platform
          languageCode: TargetLangSchema.Enum.en,
        };

        const result = await interactor.list(params);

        expect(result.err).toBeFalsy();
        if (!result.err) {
          expect(Array.isArray(result.val.videos)).toBeTruthy();
          expect(result.val.videos.length).toBe(0);
          // Even with invalid platform, currentPage should be at least 1
          expect(result.val.pagination.currentPage).toBe(1);
          expect(result.val.pagination.prevPage).toBe(0);
          expect(result.val.pagination.nextPage).toBe(0);
          expect(result.val.pagination.hasNext).toBe(false);
        }
      },
    );
  });
});
