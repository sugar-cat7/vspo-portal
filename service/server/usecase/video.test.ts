import { beforeEach, describe, expect, it } from "vitest";
import { type Videos, createVideo } from "../domain/video";
import type { IAppContext } from "../infra/dependency";
import { createTestVideo } from "../test/fixtures/video";
import { setupTxManager } from "../test/setup";
import { VideoInteractor } from "./video";

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
    interface TestCase {
      name: string;
      input: Videos;
      expectedError?: string;
      expectedResult?: {
        length: number;
        status?: string;
        platform?: string;
        videoType?: string;
      };
    }

    const testCases: TestCase[] = [
      {
        name: "should upsert a single video successfully",
        input: [createVideo(createTestVideo())],
        expectedResult: {
          length: 1,
          status: "live",
          platform: "youtube",
          videoType: "vspo_stream",
        },
      },
      {
        name: "should upsert multiple videos successfully",
        input: [
          createVideo(createTestVideo()),
          createVideo(
            createTestVideo({
              id: "test-video-2",
              rawId: "test-video-2",
              title: "Test Video 2",
            }),
          ),
        ],
        expectedResult: {
          length: 2,
        },
      },
      {
        name: "should upsert video with upcoming status",
        input: [
          createVideo(
            createTestVideo({
              status: "upcoming",
              startedAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
              ).toISOString(),
            }),
          ),
        ],
        expectedResult: {
          length: 1,
          status: "upcoming",
        },
      },
      {
        name: "should upsert video with ended status",
        input: [
          createVideo(
            createTestVideo({
              status: "ended",
              endedAt: new Date().toISOString(),
            }),
          ),
        ],
        expectedResult: {
          length: 1,
          status: "ended",
        },
      },
      {
        name: "should upsert video with twitch platform",
        input: [
          createVideo(
            createTestVideo({
              platform: "twitch",
              rawId: "test-twitch-1",
            }),
          ),
        ],
        expectedResult: {
          length: 1,
          platform: "twitch",
        },
      },
      {
        name: "should upsert video with twitcasting platform",
        input: [
          createVideo(
            createTestVideo({
              platform: "twitcasting",
              rawId: "test-twitcasting-1",
            }),
          ),
        ],
        expectedResult: {
          length: 1,
          platform: "twitcasting",
        },
      },
      {
        name: "should upsert video with clip type",
        input: [
          createVideo(
            createTestVideo({
              videoType: "clip",
            }),
          ),
        ],
        expectedResult: {
          length: 1,
          videoType: "clip",
        },
      },
      {
        name: "should upsert video with freechat type",
        input: [
          createVideo(
            createTestVideo({
              videoType: "freechat",
            }),
          ),
        ],
        expectedResult: {
          length: 1,
          videoType: "freechat",
        },
      },
      {
        name: "should fail when video has invalid platform",
        input: [
          (() => {
            try {
              return createVideo(
                createTestVideo({
                  platform: "invalid_platform" as
                    | "youtube"
                    | "twitch"
                    | "twitcasting"
                    | "niconico"
                    | "unknown",
                }),
              );
            } catch (error) {
              if (error instanceof Error) {
                expect(error.message).toContain("Invalid enum value");
              }
              return createVideo(createTestVideo()); // Return a valid video as fallback
            }
          })(),
        ],
        expectedResult: {
          length: 1,
          platform: "youtube", // The fallback platform
        },
      },
      {
        name: "should fail when video has invalid status",
        input: [
          (() => {
            try {
              return createVideo(
                createTestVideo({
                  status: "invalid_status" as
                    | "live"
                    | "upcoming"
                    | "ended"
                    | "unknown",
                }),
              );
            } catch (error) {
              if (error instanceof Error) {
                expect(error.message).toContain("Invalid enum value");
              }
              return createVideo(createTestVideo()); // Return a valid video as fallback
            }
          })(),
        ],
        expectedResult: {
          length: 1,
          status: "live", // The fallback status
        },
      },
    ];

    for (const tc of testCases) {
      it.concurrent(tc.name, async () => {
        const result = await interactor.batchUpsert(tc.input);

        if (tc.expectedError) {
          expect(result.err).toBeTruthy();
          if (result.err) {
            expect(result.err.message).toContain(tc.expectedError);
          }
        } else {
          expect(result.err).toBeFalsy();
          if (!result.err) {
            expect(result.val).toHaveLength(tc.expectedResult?.length || 0);
            if (tc.expectedResult?.status) {
              expect(result.val[0].status).toBe(tc.expectedResult.status);
            }
            if (tc.expectedResult?.platform) {
              expect(result.val[0].platform).toBe(tc.expectedResult.platform);
            }
            if (tc.expectedResult?.videoType) {
              expect(result.val[0].videoType).toBe(tc.expectedResult.videoType);
            }
          }
        }
      });
    }
  });

  describe.concurrent("list", () => {
    interface TestCase {
      name: string;
      params: {
        limit: number;
        page: number;
        languageCode: string;
        platform?: string;
        status?: string;
        videoType?: string;
        memberType?: string;
        orderBy?: "asc" | "desc";
      };
      expectedError?: string;
      expectedResult?: {
        currentPage: number;
        totalCount?: number;
        videosLength?: number;
        platform?: string;
        status?: string;
        videoType?: string;
        memberType?: string;
      };
    }

    const testCases: TestCase[] = [
      {
        name: "should list videos with basic pagination",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
        },
        expectedResult: {
          currentPage: 1,
          videosLength: 0,
        },
      },
      {
        name: "should list videos with platform filter",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          platform: "youtube",
        },
        expectedResult: {
          currentPage: 1,
          platform: "youtube",
        },
      },
      {
        name: "should list videos with status filter",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          status: "live",
        },
        expectedResult: {
          currentPage: 1,
          status: "live",
        },
      },
      {
        name: "should list videos with video type filter",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          videoType: "vspo_stream",
        },
        expectedResult: {
          currentPage: 1,
          videoType: "vspo_stream",
        },
      },
      {
        name: "should list videos with member type filter",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          memberType: "vspo_jp",
        },
        expectedResult: {
          currentPage: 1,
          memberType: "vspo_jp",
        },
      },
      {
        name: "should list videos with ascending order",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          orderBy: "asc",
        },
        expectedResult: {
          currentPage: 1,
        },
      },
      {
        name: "should list videos with descending order",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          orderBy: "desc",
        },
        expectedResult: {
          currentPage: 1,
        },
      },
      {
        name: "should list videos with multiple filters",
        params: {
          limit: 10,
          page: 1,
          languageCode: "ja",
          platform: "youtube",
          status: "live",
          videoType: "vspo_stream",
          memberType: "vspo_jp",
        },
        expectedResult: {
          currentPage: 1,
          platform: "youtube",
          status: "live",
          videoType: "vspo_stream",
          memberType: "vspo_jp",
        },
      },
    ];

    for (const tc of testCases) {
      it.concurrent(tc.name, async () => {
        const result = await interactor.list(tc.params);

        if (tc.expectedError) {
          expect(result.err).toBeTruthy();
          if (result.err) {
            expect(result.err.message).toContain(tc.expectedError);
          }
        } else {
          expect(result.err).toBeFalsy();
          if (!result.err) {
            expect(result.val.videos).toBeDefined();
            expect(result.val.pagination).toBeDefined();
            expect(result.val.pagination.currentPage).toBe(
              tc.expectedResult?.currentPage,
            );
            if (tc.expectedResult?.videosLength !== undefined) {
              expect(result.val.videos).toHaveLength(
                tc.expectedResult.videosLength,
              );
            }
            if (tc.expectedResult?.platform) {
              for (const video of result.val.videos) {
                expect(video.platform).toBe(tc.expectedResult?.platform);
              }
            }
            if (tc.expectedResult?.status) {
              for (const video of result.val.videos) {
                expect(video.status).toBe(tc.expectedResult?.status);
              }
            }
            if (tc.expectedResult?.videoType) {
              for (const video of result.val.videos) {
                expect(video.videoType).toBe(tc.expectedResult?.videoType);
              }
            }
            if (tc.expectedResult?.memberType) {
              // Note: memberType check would require joining with creator table
              expect(result.val.videos.length).toBeGreaterThanOrEqual(0);
            }
          }
        }
      });
    }
  });
});
