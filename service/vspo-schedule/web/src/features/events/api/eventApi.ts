import { VSPOApi } from "@vspo-lab/api";
import { BaseError, Err, Ok, Result } from "@vspo-lab/error";
import { Event, eventSchema } from "../domain";

export type FetchEventsParams = {
  lang?: string;
};

export type EventFetchResult = Result<
  {
    events: Event[];
  },
  BaseError
>;

/**
 * Fetch events from the API
 */
export const fetchEvents = async ({
  startedDateFrom,
  startedDateTo,
}: {
  startedDateFrom: string;
  startedDateTo: string;
}): Promise<EventFetchResult> => {
  // Initialize API client
  const client = new VSPOApi({
    apiKey: process.env.API_KEY_V2,
    baseUrl: process.env.API_URL_V2,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
  });

  const result = await client.events.list({
    limit: "100",
    page: "0",
    visibility: "public",
    startedDateFrom,
    startedDateTo,
  });
  console.log({
    limit: "100",
    page: "0",
    visibility: "public",
    startedDateFrom,
    startedDateTo,
  });

  if (result.err) {
    return Err(result.err);
  }

  // Transform API data to domain model
  const events = result.val.events.map((event) => {
    const eventData = {
      id: event.id || "",
      type: "event",
      title: event.title,
      startedDate: event.startedDate || "",
      // Additional fields with defaults
      contentSummary: {},
      isNotLink: false,
    } satisfies Event;
    return eventSchema.parse(eventData);
  });

  return Ok({
    events,
  });
};
