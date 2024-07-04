import React, { useEffect, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetStaticPaths, GetStaticProps } from "next";
import { Livestream } from "@/types/streaming";
import {
  getOneWeekRange,
  getLiveStatus,
  isValidDate,
  removeDuplicateTitles,
  formatDate,
  getInitializedI18nInstance,
  generateStaticPathsForLocales,
  groupBy,
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
import { useTimeZoneContext } from "@/hooks";

type Params = {
  status: string;
};

type LivestreamsProps = {
  livestreams: Livestream[];
  events: VspoEvent[];
  lastUpdateDate: string;
  liveStatus: string;
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
  liveStatus,
  livestreams,
  events,
}) => {
  const router = useRouter();
  const { timeZone } = useTimeZoneContext();
  const { t } = useTranslation("streams");
  const locale = router.locale ?? DEFAULT_LOCALE;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading || router.isFallback) {
    return <Loading />;
  }

  const livestreamsByDate = groupBy(livestreams, (livestream) => {
    try {
      return formatDate(livestream.scheduledStartTime, "yyyy-MM-dd", {
        timeZone,
      });
    } catch (err) {
      console.error("Invalid livestream date:", livestream.scheduledStartTime);
      return undefined;
    }
  });
  const eventsByDate = groupBy(events, (event) => {
    try {
      return formatDate(event.startedAt, "yyyy-MM-dd", { timeZone });
    } catch (err) {
      console.error("Invalid event date:", event.startedAt);
      return undefined;
    }
  });

  if (["archive", "live", "upcoming"].includes(liveStatus)) {
    return (
      <LivestreamCards
        livestreamsByDate={livestreamsByDate}
        eventsByDate={eventsByDate}
      />
    );
  }

  const tabDates = Object.keys(livestreamsByDate)
    .map((dateString) => ({
      date: convertToUTCDate(dateString),
      dateString,
      shortDateString: formatDate(dateString, "MM/dd (E)", {
        localeCode: locale,
        timeZone: "UTC",
      }),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pageDateString =
    liveStatus === "all"
      ? formatDate(getCurrentUTCDate(), "yyyy-MM-dd", { timeZone })
      : liveStatus;
  const pageDate = convertToUTCDate(pageDateString);
  let pageDateIndex = tabDates.findLastIndex(({ date }) => {
    return date.getTime() <= pageDate.getTime();
  });
  if (pageDateIndex === -1) {
    pageDateIndex = tabDates.length - 1;
  }

  const livestreamsOnDate =
    livestreamsByDate[pageDateString] === undefined
      ? {}
      : { [pageDateString]: livestreamsByDate[pageDateString] };
  const eventsOnDate =
    eventsByDate[pageDateString] === undefined
      ? {}
      : { [pageDateString]: eventsByDate[pageDateString] };

  return (
    <TabContext value={pageDateIndex}>
      {/* Date */}
      <TabBox>
        <Tabs
          aria-label={t("streamSchedule")}
          textColor="primary"
          indicatorColor="primary"
          scrollButtons="auto"
          value={pageDateIndex}
          variant="scrollable"
        >
          {tabDates.map(({ dateString, shortDateString }, i) => (
            <Tab
              role="tab"
              aria-selected={pageDateIndex === i}
              label={shortDateString}
              value={i}
              key={dateString}
              sx={{
                fontFamily: "Roboto, sans-serif",
                textAlign: "center",
                fontWeight: "700",
              }}
              LinkComponent={Link}
              href={`/schedule/${dateString}`}
            />
          ))}
        </Tabs>
      </TabBox>
      {/* Stream Content */}
      <LivestreamCards
        livestreamsByDate={livestreamsOnDate}
        eventsByDate={eventsOnDate}
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

    const { oneWeekAgo, oneWeekLater } = getOneWeekRange();
    const isDateStatus = isValidDate(params.status);

    const livestreams = removeDuplicateTitles(pastLivestreams)
      .filter((livestream) => {
        const scheduledStartTime = convertToUTCDate(
          livestream.scheduledStartTime,
        );
        if (
          freechatVideoIds.includes(livestream.id) ||
          scheduledStartTime < oneWeekAgo ||
          scheduledStartTime > oneWeekLater
        ) {
          return false;
        }
        return (
          params.status === "all" ||
          isDateStatus ||
          params.status === getLiveStatus(livestream)
        );
      })
      .sort(
        (a, b) =>
          convertToUTCDate(a.scheduledStartTime).getTime() -
          convertToUTCDate(b.scheduledStartTime).getTime(),
      );

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
    const description = t("description");

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

    return {
      props: {
        ...translations,
        livestreams,
        events,
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
    // canonicalPath={`/schedule/all`}
  >
    {page}
  </ContentLayout>
);

export default HomePage;
