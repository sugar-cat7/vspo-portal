import {
  type SQL,
  and,
  asc,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  lte,
} from "drizzle-orm";
import {
  type EventVisibility,
  EventVisibilitySchema,
  type VspoEvent,
  type VspoEvents,
  createVspoEvent,
  createVspoEvents,
} from "../../domain/event";
import {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
} from "../../pkg/dayjs";
import { AppError, Err, Ok, type Result, wrap } from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
import { withTracerResult } from "../http/trace/cloudflare";
import { buildConflictUpdateColumns } from "./helper";
import { createInsertEvent, eventTable } from "./schema";
import type { DB } from "./transaction";

type ListQuery = {
  limit: number;
  page: number;
  orderBy?: "asc" | "desc";
  visibility?: EventVisibility;
  startAt?: string;
  endAt?: string;
};

export interface IEventRepository {
  list(query: ListQuery): Promise<Result<VspoEvents, AppError>>;
  get(id: string): Promise<Result<VspoEvent | null, AppError>>;
  upsert(event: VspoEvent): Promise<Result<VspoEvent, AppError>>;
  count(query: ListQuery): Promise<Result<number, AppError>>;
  delete(eventId: string): Promise<Result<void, AppError>>;
  batchDelete(eventIds: string[]): Promise<Result<void, AppError>>;
  batchUpsert(events: VspoEvent[]): Promise<Result<VspoEvents, AppError>>;
}

export class EventRepository implements IEventRepository {
  constructor(private readonly db: DB) {}

  async list(query: ListQuery): Promise<Result<VspoEvents, AppError>> {
    return withTracerResult("EventRepository", "list", async (span) => {
      AppLogger.info("EventRepository list", {
        query,
      });
      const filters = this.buildFilters(query);

      const eventResult = await wrap(
        this.db
          .select()
          .from(eventTable)
          .where(and(...filters))
          .orderBy(
            query.orderBy === "asc" || !query.orderBy
              ? asc(eventTable.startAt)
              : desc(eventTable.startAt),
          )
          .limit(query.limit)
          .offset(query.page * query.limit)
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during event list query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (eventResult.err) {
        return Err(eventResult.err);
      }

      return Ok(
        createVspoEvents(
          eventResult.val.map((r) => {
            const event = {
              id: r.id,
              title: r.title,
              storageFileId: r.storageFileId ?? undefined,
              startAt: r.startAt ? convertToUTC(r.startAt) : undefined,
              endAt: r.endAt ? convertToUTC(r.endAt) : undefined,
              visibility: r.visibility as EventVisibility,
              tags: r.tags ? r.tags.split(",") : [],
              createdAt: convertToUTC(r.createdAt),
              updatedAt: convertToUTC(r.updatedAt),
            };

            return event;
          }),
        ),
      );
    });
  }

  async get(id: string): Promise<Result<VspoEvent | null, AppError>> {
    return withTracerResult("EventRepository", "get", async (span) => {
      const eventResult = await wrap(
        this.db
          .select()
          .from(eventTable)
          .where(eq(eventTable.id, id))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during event get query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (eventResult.err) {
        return Err(eventResult.err);
      }

      if (eventResult.val.length === 0) {
        return Ok(null);
      }

      const r = eventResult.val[0];
      return Ok(
        createVspoEvent({
          id: r.id,
          title: r.title,
          storageFileId: r.storageFileId ?? undefined,
          startAt: r.startAt ? convertToUTC(r.startAt) : undefined,
          endAt: r.endAt ? convertToUTC(r.endAt) : undefined,
          visibility: r.visibility as EventVisibility,
          createdAt: convertToUTC(r.createdAt),
          updatedAt: convertToUTC(r.updatedAt),
        }),
      );
    });
  }

  async count(query: ListQuery): Promise<Result<number, AppError>> {
    return withTracerResult("EventRepository", "count", async (span) => {
      const filters = this.buildFilters(query);

      const countResult = await wrap(
        this.db
          .select({ value: countDistinct(eventTable.id) })
          .from(eventTable)
          .where(and(...filters))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during event count query: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (countResult.err) {
        return Err(countResult.err);
      }

      return Ok(countResult.val.at(0)?.value ?? 0);
    });
  }

  async upsert(event: VspoEvent): Promise<Result<VspoEvent, AppError>> {
    return withTracerResult("EventRepository", "upsert", async (span) => {
      const dbEvent = createInsertEvent({
        id: event.id,
        title: event.title,
        storageFileId: event.storageFileId,
        startAt: event.startAt ? convertToUTCDate(event.startAt) : null,
        endAt: event.endAt ? convertToUTCDate(event.endAt) : null,
        visibility: event.visibility,
        tags: event.tags.join(","),
        updatedAt: getCurrentUTCDate(),
      });

      const result = await wrap(
        this.db
          .insert(eventTable)
          .values(dbEvent)
          .onConflictDoUpdate({
            target: eventTable.id,
            set: buildConflictUpdateColumns(eventTable, [
              "title",
              "storageFileId",
              "startAt",
              "endAt",
              "visibility",
              "tags",
              "updatedAt",
            ]),
          })
          .returning()
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during event upsert: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (result.err) {
        return Err(result.err);
      }

      const r = result.val[0];
      return Ok(
        createVspoEvent({
          id: r.id,
          title: r.title,
          storageFileId: r.storageFileId ?? undefined,
          startAt: r.startAt ? convertToUTC(r.startAt) : undefined,
          endAt: r.endAt ? convertToUTC(r.endAt) : undefined,
          visibility: r.visibility as EventVisibility,
          tags: r.tags ? r.tags.split(",") : [],
          createdAt: convertToUTC(r.createdAt),
          updatedAt: convertToUTC(r.updatedAt),
        }),
      );
    });
  }

  async delete(eventId: string): Promise<Result<void, AppError>> {
    return withTracerResult("EventRepository", "delete", async (span) => {
      const result = await wrap(
        this.db.delete(eventTable).where(eq(eventTable.id, eventId)).execute(),
        (err) =>
          new AppError({
            message: `Database error during event delete: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (result.err) {
        return Err(result.err);
      }

      return Ok();
    });
  }

  async batchDelete(eventIds: string[]): Promise<Result<void, AppError>> {
    return withTracerResult("EventRepository", "batchDelete", async (span) => {
      const result = await wrap(
        this.db
          .delete(eventTable)
          .where(inArray(eventTable.id, eventIds))
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during event batch delete: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (result.err) {
        return Err(result.err);
      }

      return Ok();
    });
  }

  async batchUpsert(
    events: VspoEvent[],
  ): Promise<Result<VspoEvents, AppError>> {
    return withTracerResult("EventRepository", "batchUpsert", async (span) => {
      const dbEvents = events.map((event) =>
        createInsertEvent({
          id: event.id,
          title: event.title,
          storageFileId: event.storageFileId,
          startAt: event.startAt ? convertToUTCDate(event.startAt) : null,
          endAt: event.endAt ? convertToUTCDate(event.endAt) : null,
          visibility: event.visibility,
          tags: event.tags.join(","),
          updatedAt: getCurrentUTCDate(),
        }),
      );

      const result = await wrap(
        this.db
          .insert(eventTable)
          .values(dbEvents)
          .onConflictDoUpdate({
            target: eventTable.id,
            set: buildConflictUpdateColumns(eventTable, [
              "title",
              "storageFileId",
              "startAt",
              "endAt",
              "visibility",
              "tags",
              "updatedAt",
            ]),
          })
          .returning()
          .execute(),
        (err) =>
          new AppError({
            message: `Database error during event batch upsert: ${err.message}`,
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );

      if (result.err) {
        return Err(result.err);
      }

      const vspoEvents = result.val.map((r) =>
        createVspoEvent({
          id: r.id,
          title: r.title,
          storageFileId: r.storageFileId ?? undefined,
          startAt: r.startAt ? convertToUTC(r.startAt) : undefined,
          endAt: r.endAt ? convertToUTC(r.endAt) : undefined,
          visibility: EventVisibilitySchema.parse(r.visibility),
          tags: r.tags ? r.tags.split(",") : [],
          createdAt: convertToUTC(r.createdAt),
          updatedAt: convertToUTC(r.updatedAt),
        }),
      );

      return Ok(vspoEvents);
    });
  }

  private buildFilters(query: ListQuery): SQL[] {
    const filters: SQL[] = [];

    if (query.visibility) {
      filters.push(eq(eventTable.visibility, query.visibility));
    }

    if (query.startAt) {
      filters.push(gte(eventTable.startAt, convertToUTCDate(query.startAt)));
    }

    if (query.endAt) {
      filters.push(lte(eventTable.endAt, convertToUTCDate(query.endAt)));
    }
    return filters;
  }
}
