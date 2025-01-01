import { createRoute } from "@hono/zod-openapi";
import type { App } from "../infra/http/hono/app";
import { openApiErrorResponses } from "../pkg/errors";
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

// const postCreatorRoute = createRoute({
//   tags: ["Creator"],
//   operationId: "postCreators",
//   method: "post" as const,
//   path: "/creators",
//   security: [{ bearerAuth: [] }],
//   request: {
//     body: {
//       required: true,
//       content: {
//         "application/json": {
//           schema: CreateCreatorRequestSchema,
//         },
//       },
//     },
//   },
//   responses: {
//     200: {
//       description: "The configuration for an api",
//       content: {
//         "application/json": {
//           schema: CreateCreatorResponseSchema,
//         },
//       },
//     },
//     ...openApiErrorResponses,
//   },
// });

// export const registerCreatorPostApi = (app: App) =>
//   app.openapi(postCreatorRoute, async (c) => {
//     const p = CreateCreatorRequestSchema.parse(await c.req.json());
//     const r =
//       await c.env.APP_WORKER.newCreatorUsecase().batchUpsertByChannelIds({
//         channel: p.channel,
//       });

//     if (r.err) {
//       throw r.err;
//     }

//     return c.json(CreateCreatorResponseSchema.parse(r.val), 200);
//   });

export const registerCreatorListApi = (app: App) =>
  app.openapi(listCreatorRoute, async (c) => {
    const p = ListCreatorRequestSchema.parse(c.req.query());

    const r = await c.env.APP_WORKER.newCreatorUsecase().list({
      limit: Number.parseInt(p.limit),
      page: Number.parseInt(p.page),
      memberType: p.memberType,
    });

    if (r.err) {
      throw r.err;
    }

    return c.json(ListCreatorResponseSchema.parse(r.val), 200);
  });
