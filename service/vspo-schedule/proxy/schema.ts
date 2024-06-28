import { z } from "@hono/zod-openapi";


export const VideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    channelId: z.any(),
    channelTitle: z.any(),
    thumbnailUrl: z.any(),
    scheduledStartTime: z.any(),
    actualEndTime: z.any(),
    iconUrl: z.any(),
    platform: z.any(),
    link: z.any(),
    viewCount: z.any(),
    likeCount: z.any(),
    commentCount: z.any(),
    twitchName: z.any(),
    createdAt: z.any(),
    twitchPastVideoId: z.any(),
    isTemp: z.any(),
    tempUrl: z.any(),
});

export const VideosSchema = z.array(z.any());

export const EventSchema = z.object({
    title: z.string(),
    contentSummary: z.string(),
    webPageLinks: z.any(),
    tweetLinks: z.any(),
    startedAt: z.any(),
    isNotLink: z.any(),
    newsId: z.any(),
});

export const EventsSchema = z.array(z.any());
