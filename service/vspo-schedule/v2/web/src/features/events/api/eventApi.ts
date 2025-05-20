import { getCloudflareContext } from "@opennextjs/cloudflare";
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
  sessionId,
}: {
  startedDateFrom: string;
  startedDateTo: string;
  sessionId?: string;
}): Promise<EventFetchResult> => {
  // Initialize API client
  const client = new VSPOApi({
    apiKey: getCloudflareContext().env.API_KEY_V2,
    baseUrl: getCloudflareContext().env.API_URL_V2,
    cfAccessClientId: getCloudflareContext().env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: getCloudflareContext().env.CF_ACCESS_CLIENT_SECRET,
    sessionId: sessionId,
  });

  const result = await client.events.list({
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
