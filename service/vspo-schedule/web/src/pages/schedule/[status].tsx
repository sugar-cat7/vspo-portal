import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetStaticPaths, GetStaticProps } from "next";
import { Livestream } from "@/types/streaming";
import {
  getOneWeekRange,
  groupBy,
  getLiveStatus,
  isValidDate,
  removeDuplicateTitles,
  formatDate,
  getInitializedI18nInstance,
  generateStaticPathsForLocales,
} from "@/lib/utils";
import { TabContext } from "@mui/lab";
import { ContentLayout } from "@/components/Layout/ContentLayout";
import { NextPageWithLayout } from "../_app";
import { LivestreamCards } from "@/components/Templates";
import { freechatVideoIds } from "@/data/freechat-video-ids";
import { fetchEvents, fetchLivestreams } from "@/lib/api";
import { VspoEvent } from "@/types/events";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loading } from "@/components/Elements";
import { useTranslation } from "next-i18next";
import { DEFAULT_LOCALE } from "@/lib/Const";
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

// https://nextjs.org/docs/pages/building-your-application/routing/internationalization#how-does-this-work-with-static-generation
export const getStaticPaths: GetStaticPaths<Params> = ({ locales }) => {
  const statusPaths = ["all", "live", "upcoming", "archive"].map((status) => ({
    params: { status },
  }));

  const datePaths = [];

  const currentDate = getCurrentUTCDate();
  const numberOfDays = 6;
  for (let i = -numberOfDays; i <= numberOfDays; i++) {
    const newDate = convertToUTCDate(currentDate);
    newDate.setDate(currentDate.getDate() + i);
    const formattedDate = formatDate(newDate, "yyyy-MM-dd");
    datePaths.push({ params: { status: formattedDate } });
  }

  const paths = generateStaticPathsForLocales(
    [...statusPaths, ...datePaths],
    locales,
  );
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps<LivestreamsProps, Params> = async ({
  params,
  locale = DEFAULT_LOCALE,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  try {
    const pastLivestreams = await fetchLivestreams({
      limit: 300,
      lang: locale,
    });
    const events = await fetchEvents({ lang: locale });
    const uniqueLivestreams = removeDuplicateTitles(pastLivestreams).filter(
      (livestream) => !freechatVideoIds.includes(livestream.id),
    );

    const { oneWeekAgo, oneWeekLater } = getOneWeekRange();
    const isDateStatus = isValidDate(params.status);
    const todayDate = getCurrentUTCDate();
    const todayDateString = formatDate(todayDate, "yyyy-MM-dd", {
      localeCode: locale,
    });

    let filteredLivestreams = uniqueLivestreams.filter((livestream) => {
      const scheduledStartTimeString = formatDate(
        convertToUTCDate(livestream.scheduledStartTime),
        "yyyy-MM-dd",
        { localeCode: locale },
      );

      const isAll = params.status === "all";
      if (isAll) {
        return scheduledStartTimeString === todayDateString;
      } else if (isDateStatus) {
        const targetDate = convertToUTCDate(params.status);
        targetDate.setHours(0, 0, 0, 0);
        return (
          scheduledStartTimeString ===
          formatDate(targetDate, "yyyy-MM-dd", { localeCode: locale })
        );
      } else {
        const scheduledStartTime = convertToUTCDate(
          livestream.scheduledStartTime,
        );
        return (
          scheduledStartTime >= oneWeekAgo &&
          scheduledStartTime <= oneWeekLater &&
          !freechatVideoIds.includes(livestream.id) &&
          params.status === getLiveStatus(livestream)
        );
      }
    });

    if (filteredLivestreams.length === 0 && params.status === "all") {
      filteredLivestreams = uniqueLivestreams.filter((livestream) => {
        const yesterdayDate = getCurrentUTCDate();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayDateString = formatDate(yesterdayDate, "yyyy-MM-dd", {
          localeCode: locale,
        });
        const scheduledStartTimeString = formatDate(
          convertToUTCDate(livestream.scheduledStartTime),
          "yyyy-MM-dd",
          { localeCode: locale },
        );
        return scheduledStartTimeString === yesterdayDateString;
      });
    }

    filteredLivestreams.sort((a, b) => {
      return (
        convertToUTCDate(a.scheduledStartTime).getTime() -
        convertToUTCDate(b.scheduledStartTime).getTime()
      );
    });
    const livestreamsByDate = groupBy(filteredLivestreams, (livestream) => {
      try {
        return formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", {
          localeCode: locale,
        });
      } catch (err) {
        console.error("Invalid date:", livestream.scheduledStartTime);
        throw err;
      }
    });

    const eventsByDate = groupBy(events, (event) => {
      try {
        return formatDate(event.startedAt, "yyyy-MM-dd", {
          localeCode: locale,
        });
      } catch (err) {
        console.error("Invalid date:", event.startedAt);
        throw err;
      }
    });

    const lastUpdateDate = formatDate(getCurrentUTCDate(), "yyyy/MM/dd HH:mm", {
      localeCode: locale,
    });
    const revalidateWindow = 30;

    const translations = await serverSideTranslations(locale, [
      "common",
      "streams",
    ]);
    const { t } = getInitializedI18nInstance(translations, "streams");

    const footerMessage = t("membersOnlyStreamsHidden");

    const livestreamDescription =
      filteredLivestreams
        .slice(-50)
        .reverse()
        .map((livestream) => livestream.title)
        .join(", ") ?? "";
    const description = `${t("description")}\n${livestreamDescription}`;

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

    if (["archive", "live", "upcoming"].includes(params.status)) {
      return {
        props: {
          ...translations,
          livestreamsByDate,
          eventsByDate,
          lastUpdateDate,
          liveStatus: params.status,
          footerMessage,
          meta: {
            title,
            headTitle,
            description,
          },
        },
        revalidate: revalidateWindow,
      };
    }

    const allDates: DateObject[] = uniqueLivestreams.map(
      (livestream: Livestream) => {
        return {
          date: formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", {
            localeCode: locale,
          }),
          formattedDateString: formatDate(
            livestream.scheduledStartTime,
            "MM/dd(E)",
            { localeCode: locale },
          ),
        };
      },
    );

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
    const today = formatDate(getCurrentUTCDate(), "yyyy-MM-dd", {
      localeCode: locale,
    });
    let todayIndex = tabDates.map((t) => t.date).indexOf(today);
    if (isDateStatus) {
      todayIndex = tabDates.map((t) => t.date).indexOf(params.status);
    }
    todayIndex = todayIndex >= 0 ? todayIndex : tabDates.length - 1;
    return {
      props: {
        ...translations,
        livestreamsByDate,
        eventsByDate,
        lastUpdateDate,
        liveStatus: params.status,
        dateTabsInfo: {
          todayIndex: todayIndex,
          tabDates: tabDates,
        },
        footerMessage,
        meta: {
          title,
          headTitle,
          description,
        },
      },
      revalidate: revalidateWindow,
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
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
    canonicalPath={`/schedule/all`}
  >
    {page}
  </ContentLayout>
);

export default HomePage;
