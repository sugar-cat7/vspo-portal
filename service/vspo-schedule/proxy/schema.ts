import { z } from "@hono/zod-openapi";


export const VideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    channelId: z.string(),
    channelTitle: z.string(),
    thumbnailUrl: z.string(),
    scheduledStartTime: z.string(),
    actualEndTime: z.string().optional(),
    iconUrl: z.string(),
    platform: z.enum(["youtube", "twitch", "twitcasting", "nicovideo"]),
    link: z.string().optional(),
    viewCount: z.number().optional(),
    likeCount: z.number().optional(),
    commentCount: z.number().optional(),
    twitchName: z.string().optional(),
    createdAt: z.string().optional(),
    twitchPastVideoId: z.string().optional(),
    isTemp: z.boolean().optional(),
    tempUrl: z.string().optional(),
});
