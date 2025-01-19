import { createRoute } from "@hono/zod-openapi";
import { openApiErrorResponses } from "../pkg/errors";
import type { App } from "../infra/http/hono/app";
import {
  ListCreatorRequestSchema,
  ListCreatorResponseSchema,
} from "./schema/http";

const listCreatorRoute = createRoute({
  tags: ["Creator"],
  operationId: "listCreators",
  method: "get" as const,
  path: "/creators",
  security: [{ bearerAuth: [] }],
  request: {
    query: ListCreatorRequestSchema,
  },
  responses: {
    200: {
      description: "The configuration for an api",
      content: {
        "application/json": {
          schema: ListCreatorResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
});

export const registerCreatorListApi = (app: App) =>
  app.openapi(listCreatorRoute, async (c) => {
    const { di } = c.get("services");
    const p = ListCreatorRequestSchema.parse(c.req.query());

    const r = await di.creatorInteractor.list({
      limit: parseInt(p.limit),
      page: parseInt(p.page),
      memberType: p.memberType,
    });

    if (r.err) {
      throw r.err;
    }

    return c.json(ListCreatorResponseSchema.parse(r.val), 200);
  });
