import { type Creator, createCreator } from "../../domain/creator";
import type { InsertCreator } from "../../infra/repository/schema";

export const testCreator: InsertCreator = {
  id: "creator-1",
  memberType: "vspo_jp",
  representativeThumbnailUrl: "https://example.com/creator-thumbnail.jpg",
  updatedAt: new Date(),
};

export const createTestCreator = (
  overrides: Partial<InsertCreator> = {},
): InsertCreator => ({
  ...testCreator,
  ...overrides,
});

export const testCreators: InsertCreator[] = [
  createTestCreator(),
  createTestCreator({
    id: "creator-2",
    memberType: "vspo_en",
  }),
  createTestCreator({
    id: "creator-3",
    memberType: "vspo_ch",
  }),
  createTestCreator({
    id: "creator-4",
    memberType: "general",
  }),
];
