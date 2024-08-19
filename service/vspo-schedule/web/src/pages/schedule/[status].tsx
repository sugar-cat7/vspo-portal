import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetServerSideProps } from "next";
import { Livestream } from "@/types/streaming";
import {
  groupBy,
  isValidDate,
  formatDate,
  getInitializedI18nInstance,
  getOneWeekRange,
} from "@/lib/utils";
import { TabContext } from "@mui/lab";
import { ContentLayout } from "@/components/Layout/ContentLayout";
import { NextPageWithLayout } from "../_app";
import { LivestreamCards } from "@/components/Templates";
import { fetchEvents, fetchLivestreams } from "@/lib/api";
import { VspoEvent } from "@/types/events";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loading } from "@/components/Elements";
import { useTranslation } from "next-i18next";
import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
  TIME_ZONE_COOKIE,
} from "@/lib/Const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { convertToUTCDate, getCurrentUTCDate } from "@/lib/dayjs";

type Params = {
  status: string;
};

type DateObject = {
  date: string;
  formattedDateString: string;
};

type LivestreamsProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  eventsByDate: Record<string, VspoEvent[]>;
  lastUpdateDate: string;
  liveStatus: string;
  dateTabsInfo?: {
    tabDates: DateObject[];
    todayIndex: number;
  };
  footerMessage: string;
  meta: {
    title: string;
    headTitle: string;
    description: string;
  };
};

const TabBox = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: "divider",
  top: "64px",
  zIndex: "1000",
  backgroundColor: theme.vars.palette.background.default,
  display: "flex",
  justifyContent: "center",
  position: "sticky",
  margin: "0 -2px",

  [theme.breakpoints.down("sm")]: {
    top: "56px",
  },
}));

const HomePage: NextPageWithLayout<LivestreamsProps> = ({
  livestreamsByDate,
  eventsByDate,
  dateTabsInfo,
}) => {
  const router = useRouter();
  const { t } = useTranslation("streams");

  if (router.isFallback) {
    return <Loading />;
  }

  if (!dateTabsInfo) {
    return (
      <LivestreamCards
        livestreamsByDate={livestreamsByDate}
        eventsByDate={eventsByDate}
      />
    );
  }
  const { tabDates, todayIndex } = dateTabsInfo;
  return (
    <TabContext value={todayIndex.toString()}>
      {/* Date */}
      <TabBox>
        <Tabs
          aria-label={t("streamSchedule")}
          textColor="primary"
          indicatorColor="primary"
          scrollButtons="auto"
          value={todayIndex.toString()}
          variant="scrollable"
        >
          {tabDates.map(({ date, formattedDateString }, i) => {
            const label = formattedDateString;
            return (
              <Tab
                role="tab"
                aria-selected={todayIndex === i}
                label={label}
                value={i.toString()}
                key={date}
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  textAlign: "center",
                  fontWeight: "700",
                }}
                LinkComponent={Link}
                href={`/schedule/${date}`}
              />
            );
          })}
        </Tabs>
      </TabBox>
      {/* Stream Content */}
      <LivestreamCards
        livestreamsByDate={livestreamsByDate}
        eventsByDate={eventsByDate}
      />
    </TabContext>
  );
};

export const getServerSideProps: GetServerSideProps<
  LivestreamsProps,
  Params
> = async ({ params, locale = DEFAULT_LOCALE, req }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  try {
    const timeZone = req.cookies[TIME_ZONE_COOKIE] ?? DEFAULT_TIME_ZONE;
    const isDateStatus = isValidDate(params.status);

    // Logic 1: Fetch uniqueLivestreams
    const fetchLivestreamsData = async () => {
      const { oneWeekAgo, oneWeekLater } = getOneWeekRange();
      const endedDate = isDateStatus
        ? convertToUTCDate(params.status)
        : oneWeekLater;
      const today = getCurrentUTCDate();

      return await fetchLivestreams({
        limit: params.status === "archive" ? 300 : 50,
        lang: locale,
        status: params.status,
        order: "asc",
        startedDate: isDateStatus
          ? params.status
          : params.status === "archive"
            ? formatDate(oneWeekAgo, "yyyy-MM-dd")
            : formatDate(today, "yyyy-MM-dd"),
        endedDate: formatDate(
          endedDate.setDate(endedDate.getDate() + 1),
          "yyyy-MM-dd",
        ),
        timezone: timeZone,
      });
    };

    // Logic 2: Fetch events
    const fetchEventsData = async () => {
      return await fetchEvents({ lang: locale });
    };

    // Logic 3: Fetch translations and create metadata
    const fetchTranslationsAndMeta = async () => {
      const translations = await serverSideTranslations(locale, [
        "common",
        "streams",
      ]);
      const { t } = getInitializedI18nInstance(translations, "streams");

      const footerMessage = t("membersOnlyStreamsHidden");

      let title = "";
      let headTitle = "";
      switch (params.status) {
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
          headTitle = t("titles.dateStatus", { date: params.status });
          break;
      }

      return { translations, footerMessage, title, headTitle, t };
    };

    // Logic 4: Fetch and calculate date-related information
    const fetchDateTabsInfo = async () => {
      const now = getCurrentUTCDate();
      now.setHours(0, 0, 0, 0);

      const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000;
      const fiveDaysAgo = convertToUTCDate(
        now.getTime() - fiveDaysInMilliseconds,
      );
      const fiveDaysLater = convertToUTCDate(
        now.getTime() + fiveDaysInMilliseconds,
      );

      const fetchList = [];
      for (
        let d = fiveDaysAgo;
        d <= fiveDaysLater;
        d.setDate(d.getDate() + 1)
      ) {
        fetchList.push(
          fetchLivestreams({
            limit: 1,
            lang: locale,
            status: formatDate(d, "yyyy-MM-dd"),
            order: "asc",
            startedDate: formatDate(d, "yyyy-MM-dd"),
            endedDate: formatDate(
              d.getTime() + 24 * 60 * 60 * 1000,
              "yyyy-MM-dd",
            ),
            timezone: timeZone,
          }),
        );
      }
      const results = await Promise.all(fetchList);
      const allDates: DateObject[] = results
        .flat()
        .map((livestream: Livestream) => {
          return {
            date: formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", {
              timeZone,
            }),
            formattedDateString: formatDate(
              livestream.scheduledStartTime,
              "MM/dd (E)",
              { localeCode: locale, timeZone },
            ),
          };
        });

      // Use a map to remove duplicates by key
      const dateMap = new Map<string, DateObject>();
      allDates.forEach((dateObj) => {
        dateMap.set(dateObj.date, dateObj);
      });

      const tabDates: DateObject[] = [...dateMap.values()]
        .sort((a, b) => {
          // Ensure that date strings are converted to Date objects for comparison
          return (
            convertToUTCDate(a.date).getTime() -
            convertToUTCDate(b.date).getTime()
          );
        })
        .filter((dateObj) => {
          const date = convertToUTCDate(dateObj.date);
          const now = getCurrentUTCDate();
          now.setHours(0, 0, 0, 0);
          const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000;
          const fiveDaysAgo = convertToUTCDate(
            now.getTime() - fiveDaysInMilliseconds,
          );
          const fiveDaysLater = convertToUTCDate(
            now.getTime() + fiveDaysInMilliseconds,
          );
          return date >= fiveDaysAgo && date <= fiveDaysLater;
        });
      const today = formatDate(getCurrentUTCDate(), "yyyy-MM-dd", { timeZone });
      let todayIndex = tabDates.map((t) => t.date).indexOf(today);
      if (isDateStatus) {
        todayIndex = tabDates.map((t) => t.date).indexOf(params.status);
      }
      todayIndex = todayIndex >= 0 ? todayIndex : tabDates.length - 1;

      return { todayIndex, tabDates };
    };

    // Execute the fetches in parallel using Promise.all
    const [
      uniqueLivestreams,
      events,
      { translations, footerMessage, title, headTitle, t },
      { todayIndex, tabDates },
    ] = await Promise.all([
      fetchLivestreamsData(),
      fetchEventsData(),
      fetchTranslationsAndMeta(),
      fetchDateTabsInfo(),
    ]);

    // Livestream description needs to be set after fetching
    const livestreamDescription =
      uniqueLivestreams
        .slice(-50)
        .reverse()
        .map((livestream) => livestream.title)
        .join(", ") ?? "";
    const description = `${t("description")}\n${livestreamDescription}`;

    const filteredLivestreams = uniqueLivestreams;
    const livestreamsByDate = groupBy(filteredLivestreams, (livestream) => {
      try {
        return formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", {
          timeZone,
        });
      } catch (err) {
        console.error("Invalid date:", livestream.scheduledStartTime);
        throw err;
      }
    });

    const eventsByDate = groupBy(events, (event) => {
      try {
        return formatDate(event.startedAt, "yyyy-MM-dd", { timeZone });
      } catch (err) {
        console.error("Invalid date:", event.startedAt);
        throw err;
      }
    });

    const lastUpdateDate = formatDate(getCurrentUTCDate(), "yyyy/MM/dd HH:mm", {
      timeZone,
    });

    return {
      props: {
        ...translations,
        livestreamsByDate,
        eventsByDate,
        lastUpdateDate,
        liveStatus: params.status,
        dateTabsInfo: {
          todayIndex,
          tabDates,
        },
        footerMessage,
        meta: {
          title,
          headTitle,
          description: description,
        },
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      notFound: true,
    };
  }
};

HomePage.getLayout = (page, pageProps) => (
  <ContentLayout
    title={pageProps.meta?.title}
    description={pageProps.meta?.description}
    lastUpdateDate={pageProps.lastUpdateDate}
    footerMessage={pageProps.footerMessage}
    headTitle={pageProps.meta?.headTitle}
    path={`/schedule/${pageProps.liveStatus}`}
    // canonicalPath={`/schedule/all`}
  >
    {page}
  </ContentLayout>
);

export default HomePage;
