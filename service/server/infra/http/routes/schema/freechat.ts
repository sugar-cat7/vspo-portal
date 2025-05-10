import { z } from "@hono/zod-openapi";
import { FreechatSchema } from "../../../../domain/freechat";
import { PaginationQuerySchema, PaginationResponseSchema } from "./common";

const FreechatResponseSchema = FreechatSchema.openapi({
  description: "Freechat",
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
    platform: "youtube",
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

const ListFreechatRequestSchema = PaginationQuerySchema.merge(
  z.object({
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
    memberType: z
      .enum(["vspo_all", "vspo_jp", "vspo_en"])
      .default("vspo_all")
      .openapi({
        description: "Member Type",
        example: "vspo_all",
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
    orderKey: z
      .enum(["publishedAt", "creatorName"])
      .default("publishedAt")
      .openapi({
        description: "Order Key",
        example: "publishedAt",
      }),
  }),
);

const ListFreechatResponseSchema = z.object({
  freechats: z.array(FreechatResponseSchema),
  pagination: PaginationResponseSchema,
});

type ListFreechatResponse = z.infer<typeof ListFreechatResponseSchema>;
type ListFreechatRequest = z.infer<typeof ListFreechatRequestSchema>;

export {
  ListFreechatRequestSchema,
  ListFreechatResponseSchema,
  type ListFreechatRequest,
  type ListFreechatResponse,
  FreechatResponseSchema,
};
