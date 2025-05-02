import { describe, it, expect } from "vitest";
import { mapApiClipsToClips } from "./api/dto";
import { Result } from "@vspo-lab/error";
import { ListClips200 } from "@vspo-lab/api";

describe("DTO Utilities", () => {
  describe("mapApiClipsToClips", () => {
    it("should convert API clips to app Clip type", () => {
      // Mock Result with success
      const mockResult: Result<ListClips200, any> = {
        err: null,
        val: {
          clips: [
            {
              id: "clip1",
              rawId: "rawClip1",
              title: "Test Clip",
              languageCode: "ja",
              rawChannelID: "channel1",
              description: "Test description",
              publishedAt: "2023-01-01T00:00:00Z",
              platform: "youtube",
              tags: ["tag1", "tag2"],
              thumbnailURL: "https://example.com/thumbnail.jpg",
              creatorName: "Test Creator",
              creatorThumbnailURL: "https://example.com/creator.jpg",
              viewCount: 1000,
              link: "https://example.com/clip1",
              deleted: false,
              translated: false,
              type: "clip"
            }
          ],
          pagination: {
            currentPage: 1,
            totalPage: 1,
            totalCount: 1,
            hasNext: false
          }
        }
      };

      const result = mapApiClipsToClips(mockResult);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "clip1",
        title: "Test Clip",
        description: "Test description",
        channelId: "channel1",
        channelTitle: "Test Creator",
        thumbnailUrl: "https://example.com/thumbnail.jpg",
        platform: "youtube",
        viewCount: "1000",
        likeCount: undefined,
        commentCount: undefined,
        createdAt: "2023-01-01T00:00:00Z",
        link: "https://example.com/clip1",
        iconUrl: "https://example.com/creator.jpg"
      });
    });

    it("should return empty array when result is error", () => {
      // Mock Result with error
      const mockResult: Result<ListClips200, any> = {
        err: new Error("Test error"),
        val: null
      };

      const result = mapApiClipsToClips(mockResult);

      expect(result).toEqual([]);
    });
  });
}); 