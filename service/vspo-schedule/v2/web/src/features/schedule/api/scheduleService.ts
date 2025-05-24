import { IncomingMessage } from "http";
import { fetchEvents } from "@/features/shared/api/event";
import { fetchLivestreams } from "@/features/shared/api/livestream";
import { Event, Livestream } from "@/features/shared/domain";
import { serverSideTranslations } from "@/lib/i18n/server";
import { getSessionId } from "@/lib/utils";
import { SSRConfig } from "next-i18next";

type Schedule = {
  events: Event[];
  livestreams: Livestream[];
  translations: SSRConfig;
};

type FetchScheduleParams = {
  startedDate: string;
  limit: number;
  locale: string;
  status: "live" | "upcoming" | "archive" | "all";
  order: "asc" | "desc";
  timeZone: string;
  memberType?: string;
  platform?: string;
  req: IncomingMessage;
};

const fetchSchedule = async (
  params: FetchScheduleParams,
): Promise<Schedule> => {
  const {
    startedDate,
    limit,
    locale,
    status,
    order,
    timeZone,
    memberType,
    platform,
    req,
  } = params;

  const sessionId = getSessionId(req);

  const results = await Promise.allSettled([
    fetchEvents({
      startedDateFrom: startedDate,
      startedDateTo: startedDate,
      lang: locale,
      sessionId,
    }),
    fetchLivestreams({
      limit,
      lang: locale ?? "default",
      status: status || "all",
      order: order,
      timezone: timeZone,
      startedDate,
      memberType,
      platform,
      sessionId,
    }),
    serverSideTranslations(locale || "ja", ["common", "streams", "schedule"]),
  ]);

  const events =
    results[0].status === "fulfilled" && !results[0].value.err
      ? results[0].value.val?.events || []
      : [];

  const livestreams =
    results[1].status === "fulfilled" && !results[1].value.err
      ? results[1].value.val?.livestreams || []
      : [];

  const translations =
    results[2].status === "fulfilled"
      ? results[2].value
      : await serverSideTranslations(locale || "ja", [
          "common",
          "streams",
          "schedule",
        ]);

  return {
    events,
    livestreams,
    translations,
  };
};

export { fetchSchedule, type Schedule, type FetchScheduleParams };
