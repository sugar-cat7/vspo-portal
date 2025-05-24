import { fetchSchedule } from "@/features/schedule/api/scheduleService";
import { Event } from "@/features/shared/domain";
import { Livestream } from "@/features/shared/domain/livestream";
import { DEFAULT_TIME_ZONE } from "@/lib/Const";
import { TIME_ZONE_COOKIE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import {
  formatDate,
  getInitializedI18nInstance,
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

  // Fetch data using fetchSchedule
  const schedule = await fetchSchedule({
    startedDate,
    limit,
    locale: locale ?? "ja",
    status: (status as "live" | "upcoming" | "archive" | "all") || "all",
    order: order as "asc" | "desc",
    timeZone,
    memberType,
    platform,
    req,
  });

  const lastUpdateTimestamp = Date.now();

  // Extract data from schedule
  const events = schedule.events;
  const livestreams = schedule.livestreams;
  const translations = schedule.translations;

  // Group livestreams by date
  const livestreamsByDate = groupBy(livestreams, (livestream) =>
    formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", { timeZone }),
  );

  // Set up metadata and footer message
  const { t } = getInitializedI18nInstance(translations, "streams");
  const footerMessage = t("membersOnlyStreamsHidden");
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
