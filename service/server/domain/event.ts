import { getCurrentUTCDate } from "@vspo-lab/dayjs";
import { z } from "zod";
import { createUUID } from "../pkg/uuid";

// Define visibility options
const EventVisibilitySchema = z.enum(["public", "private", "internal"]);
type EventVisibility = z.infer<typeof EventVisibilitySchema>;

// Base URL for public event access
const PUBLIC_EVENT_BASE_URL = process.env.PUBLIC_EVENT_BASE_URL;

// Event schema definition
const VspoEventSchema = z
  .object({
    id: z.string().default(() => createUUID()),
    title: z.string(),
    storageFileId: z.string(),
    startedDate: z.string(),
    visibility: EventVisibilitySchema.default("private"),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().default(() => getCurrentUTCDate().toISOString()),
    updatedAt: z.string().default(() => getCurrentUTCDate().toISOString()),
  })
  .transform((event) => {
    // Generate a public URL if the event is public
    const publicUrl =
      event.visibility === "public"
        ? `${PUBLIC_EVENT_BASE_URL}/${event.storageFileId}`
        : undefined;

    return {
      ...event,
      publicUrl,
    };
  });

// Array schema
const VspoEventsSchema = z.array(VspoEventSchema);

// Event types
type VspoEventInput = z.input<typeof VspoEventSchema>;
type VspoEvent = z.output<typeof VspoEventSchema>;
type VspoEvents = z.output<typeof VspoEventsSchema>;

// Creator functions
const createVspoEvent = (event: Partial<VspoEventInput>): VspoEvent => {
  return VspoEventSchema.parse({
    id: event.id || createUUID(),
    title: event.title || "",
    storageFileId: event.storageFileId || "",
    startedDate: event.startedDate,
    visibility: event.visibility || "private",
    createdAt: event.createdAt || getCurrentUTCDate().toISOString(),
    updatedAt: event.updatedAt || getCurrentUTCDate().toISOString(),
  });
};

const createVspoEvents = (events: Partial<VspoEventInput>[]): VspoEvents => {
  return events.map((event) => createVspoEvent(event));
};

export {
  VspoEventSchema,
  VspoEventsSchema,
  EventVisibilitySchema,
  type VspoEventInput,
  type VspoEvent,
  type VspoEvents,
  type EventVisibility,
  createVspoEvent,
  createVspoEvents,
};
