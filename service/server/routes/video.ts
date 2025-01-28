import { createRoute } from "@hono/zod-openapi";
import type { App } from "../infra/http/hono/app";
import { convertToUTCDate } from "../pkg/dayjs";
import { openApiErrorResponses } from "../pkg/errors";
import {
  CreateVideoRequestSchema,
  CreateVideoResponseSchema,
  ListVideoRequestSchema,
  ListVideoResponseSchema,
} from "./schema/http";

const listVideosRoute = createRoute({
  tags: ["Video"],
  operationId: "listVideos",
  method: "get" as const,
  path: "/videos",
  security: [{ bearerAuth: [] }],
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

const postVideosRoute = createRoute({
  tags: ["Video"],
  operationId: "postVideos",
  method: "post" as const,
  path: "/videos",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateVideoRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "The configuration for an api",
      content: {
        "application/json": {
          schema: CreateVideoResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
});

export const registerVideoPostApi = (app: App) =>
  app.openapi(postVideosRoute, async (c) => {
    const p = CreateVideoRequestSchema.parse(await c.req.json());
    const r = await c.env.APP_WORKER.newVideoUsecase().batchUpsertByIds(p);
    if (r.err) {
      throw r.err;
    }
    return c.json(CreateVideoResponseSchema.parse(r.val), 200);
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
    });

    if (r.err) {
      throw r.err;
    }

    return c.json(ListVideoResponseSchema.parse(r.val), 200);
  });
