import { z } from "zod";
import { PaginationQuerySchema, PaginationResponseSchema } from "./common";

const MemberTypeSchema = z.enum(["vspo_jp", "vspo_en", "vspo_ch", "general"]);
const ThumbnailURLSchema = z.string().url();

const ChannelDetailSchema = z.object({
  rawId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  thumbnailURL: ThumbnailURLSchema,
  publishedAt: z.date().nullable(),
  subscriberCount: z.number().int().nullable(),
}).nullable();

const ChannelSchema = z.object({
  id: z.string(),
  creatorID: z.string(),
  youtube: ChannelDetailSchema,
  twitch: ChannelDetailSchema,
  twitCasting: ChannelDetailSchema,
  niconico: ChannelDetailSchema,
});

const CreatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  memberType: MemberTypeSchema,
  thumbnailURL: ThumbnailURLSchema,
  channel: ChannelSchema.nullable(),
});
const ListCreatorRequestSchema = PaginationQuerySchema.merge(z.object({
    memberType: MemberTypeSchema.optional(),
}));

const ListCreatorResponseSchema = z.object({
    creators: z.array(CreatorSchema),
    pagination: PaginationResponseSchema,
});

type ListCreatorResponse = z.infer<typeof ListCreatorResponseSchema>;
type ListCreatorRequest = z.infer<typeof ListCreatorRequestSchema>;

export { CreatorSchema, ListCreatorResponseSchema, ListCreatorResponse, ListCreatorRequest, ListCreatorRequestSchema };