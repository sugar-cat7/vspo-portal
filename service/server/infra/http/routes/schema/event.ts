import { z } from "@hono/zod-openapi";
import { EventVisibilitySchema } from "../../../../domain/event";
import { PaginationQuerySchema, PaginationResponseSchema } from "./common";

const VspoEventSchema = z.object({
  id: z.string().openapi({
    description: "Event ID",
    example: "event-123456",
  }),
  title: z.string().openapi({
    description: "Event title",
    example: "ぶいすぽっ！感謝祭2023",
  }),
  storageFileId: z.string().openapi({
    description: "Storage file ID containing event details",
    example: "file-abcdef",
  }),
  startAt: z.string().optional().openapi({
    description: "Event start datetime (ISO format)",
    example: "2023-12-01T10:00:00.000Z",
  }),
  endAt: z.string().optional().openapi({
    description: "Event end datetime (ISO format)",
    example: "2023-12-01T18:00:00.000Z",
  }),
  visibility: EventVisibilitySchema.openapi({
    description: "Event visibility status",
    example: "public",
  }),
  createdAt: z.string().openapi({
    description: "Creation datetime",
    example: "2023-11-15T08:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update datetime",
    example: "2023-11-15T08:00:00.000Z",
  }),
});

const CreateEventRequestSchema = z.object({
  title: z.string().openapi({
    description: "Event title",
    example: "ぶいすぽっ！感謝祭2023",
  }),
  storageFileId: z.string().openapi({
    description: "Storage file ID containing event details",
    example: "file-abcdef",
  }),
  startAt: z.string().optional().openapi({
    description: "Event start datetime (ISO format)",
    example: "2023-12-01T10:00:00.000Z",
  }),
  endAt: z.string().optional().openapi({
    description: "Event end datetime (ISO format)",
    example: "2023-12-01T18:00:00.000Z",
  }),
  visibility: EventVisibilitySchema.default("private").openapi({
    description: "Event visibility status",
    example: "private",
  }),
});

const UpdateEventRequestSchema = CreateEventRequestSchema.partial().merge(
  z.object({
    id: z.string().openapi({
      description: "Event ID",
      example: "event-123456",
    }),
  }),
);

const ListEventRequestSchema = PaginationQuerySchema.merge(
  z.object({
    visibility: EventVisibilitySchema.optional().openapi({
      description: "Filter by visibility status",
      example: "public",
      param: {
        name: "visibility",
        in: "query",
        style: "form",
        explode: false,
      },
    }),
    orderBy: z
      .enum(["asc", "desc"])
      .default("desc")
      .openapi({
        description: "Order By start time",
        example: "desc",
        param: {
          name: "orderBy",
          in: "query",
        },
      }),
    startAt: z.string().optional().openapi({
      description: "Start datetime (ISO format)",
      example: "2023-12-01T10:00:00.000Z",
    }),
    endAt: z
      .string()
      .optional()
      .openapi({
        description: "End datetime (ISO format)",
        example: "2023-12-01T18:00:00.000Z",
        param: {
          name: "endAt",
          in: "query",
        },
      }),
  }),
);
const GetEventParamsSchema = z.object({
  id: z.string().openapi({
    description: "Event ID",
    example: "event-123456",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

const ListEventResponseSchema = z.object({
  events: z.array(VspoEventSchema),
  pagination: PaginationResponseSchema,
});

type VspoEvent = z.infer<typeof VspoEventSchema>;
type ListEventRequest = z.infer<typeof ListEventRequestSchema>;
type ListEventResponse = z.infer<typeof ListEventResponseSchema>;
type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;
type GetEventParams = z.infer<typeof GetEventParamsSchema>;

export {
  VspoEventSchema,
  ListEventRequestSchema,
  ListEventResponseSchema,
  CreateEventRequestSchema,
  UpdateEventRequestSchema,
  GetEventParamsSchema,
  type VspoEvent,
  type ListEventRequest,
  type ListEventResponse,
  type CreateEventRequest,
  type UpdateEventRequest,
  type GetEventParams,
};
