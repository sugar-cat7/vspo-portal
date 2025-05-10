import { z } from "zod";

export type Platform = "youtube" | "twitch";

/**
 * Zod schema for clips
 */
export const clipSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  channelId: z.string(),
  channelTitle: z.string(),
  thumbnailUrl: z.string(),
  platform: z
    .string()
    .refine((val): val is Platform => ["youtube", "twitch"].includes(val)),
  viewCount: z.union([z.string(), z.number()]).optional(),
  likeCount: z.union([z.string(), z.number()]).optional(),
  commentCount: z.string().optional(),
  createdAt: z.string().optional(),
  link: z.string().optional(),
  scheduledStartTime: z.string().optional(),
  channelThumbnailUrl: z.string().optional(),
});

/**
 * Zod schema for pagination information
 */
export const paginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number(),
});

/**
 * Zod schema for sort options
 */
export const sortOptionSchema = z.enum(["new", "popular", "recommended"]);

/**
 * Zod schema for clip filter conditions
 */
export const clipFilterSchema = z.object({
  members: z.array(z.string()),
  keyword: z.string(),
  timeframe: z.enum(["all", "1day", "1week", "1month"]),
});

// Infer types from schemas
export type Clip = z.infer<typeof clipSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type SortOption = z.infer<typeof sortOptionSchema>;
export type ClipFilter = z.infer<typeof clipFilterSchema>;
