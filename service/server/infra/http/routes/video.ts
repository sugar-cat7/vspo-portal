import { createRoute, z } from "@hono/zod-openapi";

import { convertToUTCDate } from "../../../pkg/dayjs";
import { openApiErrorResponses } from "../../../pkg/errors";
import type { App } from "../hono";
import {
  ListVideoRequestSchema,
  ListVideoResponseSchema,
  VideoResponseSchema,
} from "./schema";

const listVideosRoute = createRoute({
  tags: ["Video"],
  operationId: "listVideos",
  method: "get" as const,
  path: "/api/videos",
  security: [{ apiKeyAuth: [] }],
  request: {
    query: ListVideoRequestSchema,
  },
  responses: {
    200: {
      description: "The configuration for an api",
      content: {
        "application/json": {
          schema: ListVideoResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
});

const postVideoRoute = createRoute({
  tags: ["Video"],
  operationId: "postVideo",
  method: "post" as const,
  path: "/api/videos/search",
  security: [{ apiKeyAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            videoIds: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The configuration for an api",
      content: {
        "application/json": {
          schema: z.object({
            videos: z.array(VideoResponseSchema),
          }),
        },
      },
    },
    ...openApiErrorResponses,
  },
});

export const registerVideoListApi = (app: App) =>
  app.openapi(listVideosRoute, async (c) => {
    const p = ListVideoRequestSchema.parse(c.req.query());
    const r = await c.env.APP_WORKER.newVideoUsecase().list({
      limit: Number.parseInt(p.limit),
      page: Number.parseInt(p.page),
      platform: p.platform,
      status: p.status,
      videoType: p.videoType,
      startedAt: p.startedAt ? convertToUTCDate(p.startedAt) : undefined,
      endedAt: p.endedAt ? convertToUTCDate(p.endedAt) : undefined,
      languageCode: p.languageCode,
      orderBy: p.orderBy,
    });

    if (r.err) {
      throw r.err;
    }

    return c.json(ListVideoResponseSchema.parse(r.val), 200);
  });

export const registerVideoPostApi = (app: App) =>
  app.openapi(postVideoRoute, async (c) => {
    const p = await c.req.json();
    console.log(p);
    const r =
      await c.env.APP_WORKER.newVideoUsecase().searchByVideosIdsAndCreate({
        videoIds: p.videoIds,
      });

    if (r.err) {
      throw r.err;
    }
    return c.json(
      {
        videos: z.array(VideoResponseSchema).parse(r.val),
      },
      200,
    );
  });
