import { createRoute } from "@hono/zod-openapi";

import { openApiErrorResponses } from "../../../pkg/errors";
import type { App } from "../hono";
import { ListClipRequestSchema, ListClipResponseSchema } from "./schema";

const listClipsRoute = createRoute({
  tags: ["Clip"],
  operationId: "listClips",
  method: "get" as const,
  path: "/api/clips",
  security: [{ apiKeyAuth: [] }],
  request: {
    query: ListClipRequestSchema,
  },
  responses: {
    200: {
      description: "The configuration for an api",
      content: {
        "application/json": {
          schema: ListClipResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
});

export const registerClipListApi = (app: App) =>
  app.openapi(listClipsRoute, async (c) => {
    const p = ListClipRequestSchema.parse(c.req.query());
    const r = await c.env.APP_WORKER.newClipUsecase().list({
      limit: Number.parseInt(p.limit),
      page: Number.parseInt(p.page),
      platform: p.platform,
      languageCode: p.languageCode,
      orderBy: p.orderBy,
      clipType: p.clipType,
    });

    if (r.err) {
      throw r.err;
    }

    return c.json(ListClipResponseSchema.parse(r.val), 200);
  });
