import { type AppError, Ok, type Result } from "@vspo-lab/error";
import type { EventVisibility, VspoEvent, VspoEvents } from "../domain/event";
import { type Page, createPage } from "../domain/pagination";
import type { IAppContext } from "../infra/dependency";

export type UpsertEventParam = VspoEvent;
export type BatchUpsertEventParam = VspoEvent[];

export type ListEventsQuery = {
  limit: number;
  page: number;
  orderBy?: "asc" | "desc";
  visibility?: EventVisibility;
  startedDateFrom?: string;
  startedDateTo?: string;
};

export type ListEventsResponse = {
  events: VspoEvents;
  pagination: Page;
};

export interface IEventInteractor {
  list(query: ListEventsQuery): Promise<Result<ListEventsResponse, AppError>>;
  upsert(params: UpsertEventParam): Promise<Result<VspoEvent, AppError>>;
  get(id: string): Promise<Result<VspoEvent | null, AppError>>;
  delete(eventId: string): Promise<Result<void, AppError>>;
  batchUpsert(
    events: BatchUpsertEventParam,
  ): Promise<Result<VspoEvents, AppError>>;
  batchDelete(eventIds: string[]): Promise<Result<void, AppError>>;
}

export class EventInteractor implements IEventInteractor {
  constructor(private readonly context: IAppContext) {}

  async list(
    query: ListEventsQuery,
  ): Promise<Result<ListEventsResponse, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      const events = await repos.eventRepository.list(query);

      if (events.err) {
        return events;
      }

      const pagination = await repos.eventRepository.count(query);

      if (pagination.err) {
        return pagination;
      }

      return Ok({
        events: events.val,
        pagination: createPage({
          currentPage: query.page,
          limit: query.limit,
          totalCount: pagination.val,
        }),
      });
    });
  }

  async upsert(params: UpsertEventParam): Promise<Result<VspoEvent, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      return repos.eventRepository.upsert(params);
    });
  }

  async get(id: string): Promise<Result<VspoEvent | null, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      return repos.eventRepository.get(id);
    });
  }

  async delete(eventId: string): Promise<Result<void, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      return repos.eventRepository.delete(eventId);
    });
  }

  async batchUpsert(
    events: BatchUpsertEventParam,
  ): Promise<Result<VspoEvents, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      return repos.eventRepository.batchUpsert(events);
    });
  }

  async batchDelete(eventIds: string[]): Promise<Result<void, AppError>> {
    return this.context.runInTx(async (repos, _services) => {
      return repos.eventRepository.batchDelete(eventIds);
    });
  }
}
