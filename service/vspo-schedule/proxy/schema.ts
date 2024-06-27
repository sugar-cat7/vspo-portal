import { z } from "@hono/zod-openapi";


export const VideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    channelId: z.string().optional(),
    channelTitle: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    scheduledStartTime: z.string().optional(),
    actualEndTime: z.string().optional(),
    iconUrl: z.string().optional(),
    platform: z.enum(["youtube", "twitch", "twitcasting", "nicovideo"]).optional(),
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

export const EventSchema = z.object({
    title: z.string(),
    contentSummary: z.string(),
    webPageLinks: z.array(z.string()),
    tweetLinks: z.array(z.string()),
    startedAt: z.string(),
    isNotLink: z.boolean(),
    newsId: z.string(),
})
