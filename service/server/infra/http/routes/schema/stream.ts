import { z } from "@hono/zod-openapi";
import { PlatformSchema } from "../../../../domain";
import { StatusSchema } from "../../../../domain/stream";
import { PaginationQuerySchema, PaginationResponseSchema } from "./common";

// Create a simpler schema for OpenAPI that doesn't directly use the domain schema
const StreamResponseSchema = z
  .object({
    id: z.string(),
    rawId: z.string(),
    title: z.string(),
    languageCode: z.string(),
    rawChannelID: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    startedAt: z.string().nullable(),
    endedAt: z.string().nullable(),
    platform: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    viewCount: z.number(),
    thumbnailURL: z.string(),
    creatorName: z.string().optional(),
    creatorThumbnailURL: z.string().optional(),
    deleted: z.boolean(),
    translated: z.boolean().optional(),
  })
  .openapi({
    description: "Stream",
    example: {
      id: "O0XCK3NhzqE",
      rawId: "O0XCK3NhzqE",
      title:
        "【APEX】ランドマークは溶岩になった！！#三清傑WIN w/まつりちゃん,えるちゃん【ぶいすぽっ！/ 藍沢エマ】",
      languageCode: "ja",
      rawChannelID: "UCPkKpOHxEDcwmUAnRpIu-Ng",
      description:
        "ぶいすぽっ！所属の藍沢エマです！\nApexの配信をします！\nチャンネル登録、高評価よろしくお願いします！",
      publishedAt: "2023-05-20T12:00:00.000Z",
      startedAt: "2023-05-20T12:00:00.000Z",
      endedAt: "2023-05-20T15:30:00.000Z",
      platform: "youtube",
      status: "ended",
      tags: ["APEX", "ぶいすぽっ！", "藍沢エマ", "三清傑"],
      viewCount: 125000,
      thumbnailURL: "https://i.ytimg.com/vi/O0XCK3NhzqE/hqdefault_live.jpg",
      creatorName: "藍沢エマ",
      creatorThumbnailURL:
        "https://yt3.googleusercontent.com/oIps6UVvqtpJykcdjYYyRvhdcyVoR1wAdH8CnTp4msMaKYdn8XMLj4FHsLoqfWaJzbLJKSPjCg=s176-c-k-c0x00ffffff-no-rj",
      deleted: false,
      translated: false,
    },
  });

const ListStreamRequestSchema = PaginationQuerySchema.merge(
  z.object({
    platform: PlatformSchema.optional().openapi({
      description: "Platform",
      example: "youtube",
      param: {
        name: "platform",
        in: "query",
      },
    }),
    status: StatusSchema.optional().openapi({
      description: "Status",
      example: "live",
      param: {
        name: "status",
        in: "query",
      },
    }),
    startedAt: z
      .string()
      .optional()
      .openapi({
        description: "Started At",
        example: "2022-01-01T00:00:00.000Z",
        param: {
          name: "startedAt",
          in: "query",
        },
      }),
    endedAt: z
      .string()
      .optional()
      .openapi({
        description: "Ended At",
        example: "2022-01-01T00:00:00.000Z",
        param: {
          name: "endedAt",
          in: "query",
        },
      }),
    languageCode: z
      .string()
      .default("default")
      .openapi({
        description: "Language Code",
        example: "en",
        param: {
          name: "languageCode",
          in: "query",
        },
      }),
    orderBy: z
      .enum(["asc", "desc"])
      .default("desc")
      .openapi({
        description: "Order By",
        example: "desc",
        param: {
          name: "orderBy",
          in: "query",
        },
      }),
  }),
);

const ListStreamResponseSchema = z.object({
  streams: z.array(StreamResponseSchema),
  pagination: PaginationResponseSchema,
});

type ListStreamResponse = z.infer<typeof ListStreamResponseSchema>;
type ListStreamRequest = z.infer<typeof ListStreamRequestSchema>;

export {
  ListStreamRequestSchema,
  ListStreamResponseSchema,
  type ListStreamRequest,
  type ListStreamResponse,
  StreamResponseSchema,
};
