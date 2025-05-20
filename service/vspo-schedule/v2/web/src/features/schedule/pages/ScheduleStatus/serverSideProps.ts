import { Event } from "@/features/events/domain";
import {
  fetchEvents,
  fetchLivestreams,
} from "@/features/schedule/api/scheduleService";
import { Livestream } from "@/features/schedule/domain";
import { DEFAULT_TIME_ZONE } from "@/lib/Const";
import { TIME_ZONE_COOKIE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { serverSideTranslations } from "@/lib/i18n/server";
import {
  formatDate,
  getInitializedI18nInstance,
  getSessionId,
  getSetCookieTimeZone,
  groupBy,
} from "@/lib/utils";
import { GetServerSideProps } from "next";

export type ScheduleStatusPageProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  events: Event[];
  timeZone: string;
  locale: string;
  lastUpdateTimestamp: number;
  liveStatus: string;
  footerMessage: string;
  meta: {
    title: string;
    headTitle: string;
    description: string;
  };
};

export const getLivestreamsServerSideProps: GetServerSideProps<
  ScheduleStatusPageProps
> = async (context) => {
  const { status } = context.params ?? {};
  const { locale, req, res } = context;
  const timeZone =
    getSetCookieTimeZone(res) ??
    req.cookies[TIME_ZONE_COOKIE] ??
    DEFAULT_TIME_ZONE;
  const liveStatus = (status as string) || "all";

  // Extract additional parameters from query
  const {
    limit: customLimit,
    date: customStartedDate,
    memberType: customMemberType,
    platform: customPlatform,
  } = context.query;

  const startedDate =
    typeof customStartedDate === "string"
      ? customStartedDate
      : formatDate(getCurrentUTCDate(), "yyyy-MM-dd", { timeZone });

  const limit =
    typeof customLimit === "string"
      ? parseInt(customLimit, 10)
      : status === "archive"
        ? 300
        : 50;

  const order = status === "archive" ? "desc" : "asc";

  const memberType =
    typeof customMemberType === "string" ? customMemberType : undefined;

  const platform =
    typeof customPlatform === "string" ? customPlatform : undefined;
  console.log({
    limit,
    lang: locale ?? "default",
    status: (status as "live" | "upcoming" | "archive" | "all") || "all",
    order: order,
    timezone: timeZone,
    startedDate,
    memberType,
    platform,
    sessionId: getSessionId(req),
  });
  // Fetch data in parallel using Promise.allSettled
  const [eventsResult, livestreamsResult, translationsResult] =
    await Promise.allSettled([
      fetchEvents({
        startedDate,
        sessionId: getSessionId(req),
      }),
      fetchLivestreams({
        limit,
        lang: locale ?? "default",
        status: (status as "live" | "upcoming" | "archive" | "all") || "all",
        order: order,
        timezone: timeZone,
        startedDate,
        memberType,
        platform,
        sessionId: getSessionId(req),
      }),
      serverSideTranslations(locale || "ja", ["common", "streams", "schedule"]),
    ]);

  const lastUpdateTimestamp = Date.now();

  // Extract results or use defaults
  const events =
    eventsResult.status === "fulfilled"
      ? eventsResult.value.val?.events || []
      : [];

  if (eventsResult.status === "rejected") {
    console.error("Error fetching events:", eventsResult.reason);
  }

  const livestreams =
    livestreamsResult.status === "fulfilled"
      ? livestreamsResult.value
      : { val: { livestreams: [] } };

  if (livestreamsResult.status === "rejected") {
    console.error("Error fetching livestreams:", livestreamsResult.reason);
  }

  const translations =
    translationsResult.status === "fulfilled" ? translationsResult.value : {};

  if (translationsResult.status === "rejected") {
    console.error("Error loading translations:", translationsResult.reason);
  }

  // Group livestreams by date
  const livestreamsByDate = groupBy(
    livestreams.val?.livestreams ?? [],
    (livestream) =>
      formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", { timeZone }),
  );

  // Set up metadata and footer message
  const { t } = getInitializedI18nInstance(translations, "streams");
  const footerMessage = t("membersOnlyStreamsHidden");
  console.log(t("membersOnlyStreamsHidden"));
  // Create metadata based on the status
  let title = "";
  let headTitle = "";
  let description = "";

  switch (liveStatus) {
    case "all":
      title = t("titles.streamSchedule");
      break;
    case "live":
      title = t("titles.live");
      break;
    case "upcoming":
      title = t("titles.upcoming");
      break;
    case "archive":
      title = t("titles.archive");
      break;
    default:
      title = t("titles.streamSchedule");
      headTitle = t("titles.dateStatus", { date: liveStatus });
      break;
  }

  // Create livestream description from titles
  const allLivestreams = Object.values(livestreamsByDate).flat();
  const livestreamDescription =
    allLivestreams
      .slice(-50)
      .reverse()
      .map((livestream) => livestream.title)
      .join(", ") || "";

  description = `${t("description")}\n${livestreamDescription}`;
  return {
    props: {
      livestreamsByDate,
      events,
      timeZone,
      locale: locale || "ja",
      lastUpdateTimestamp,
      liveStatus,
      footerMessage,
      meta: {
        title,
        headTitle,
        description,
      },
      ...translations,
    },
  };
};
