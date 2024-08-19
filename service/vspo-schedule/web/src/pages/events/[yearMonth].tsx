import {
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  TextField,
  Button,
  Toolbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextPageWithLayout } from "../_app";
import { VspoEvent } from "@/types/events";
import { ContentLayout } from "@/components/Layout";
import { useMediaQuery } from "@mui/material";
import { members } from "@/data/members";
import {
  formatDate,
  generateStaticPathsForLocales,
  getInitializedI18nInstance,
  groupEventsByYearMonth,
} from "@/lib/utils";
import React, { useEffect } from "react";
import { fetchEvents } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { convertToUTCDate, getCurrentUTCDate } from "@/lib/dayjs";
import { useTimeZoneContext } from "@/hooks";

type Params = {
  yearMonth: string;
};

type Props = {
  events: VspoEvent[];
  lastUpdateDate: string;
  nextYearMonth?: string;
  beforeYearMonth?: string;
  currentYearMonth?: string;
  latestYearMonth?: string;
  meta: {
    title: string;
    description: string;
  };
};

type EventsByDate = {
  [date: string]: VspoEvent[];
};

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  [theme.breakpoints.down("sm")]: {
    width: 28,
    height: 28,
  },
}));

const AdjacentYearMonthButton: React.FC<{
  disabled: boolean;
  yearMonth?: string;
  children: React.ReactNode;
}> = ({ disabled, yearMonth, children }) => (
  <Button
    color="inherit"
    {...(disabled
      ? { disabled: true }
      : { component: Link, href: `/events/${yearMonth}` })}
  >
    {children}
  </Button>
);

const YearMonthSelector: React.FC<{
  beforeYearMonth?: string;
  currentYearMonth?: string;
  nextYearMonth?: string;
}> = ({ beforeYearMonth, currentYearMonth, nextYearMonth }) => {
  const { t } = useTranslation("events");

  return (
    <>
      <AdjacentYearMonthButton
        disabled={!beforeYearMonth}
        yearMonth={beforeYearMonth}
      >
        {t("prevMonth")}
      </AdjacentYearMonthButton>
      <Typography
        variant="h6"
        component="div"
        style={{ width: "160px", textAlign: "center" }}
      >
        {currentYearMonth &&
          t("currMonth", { val: convertToUTCDate(currentYearMonth) })}
      </Typography>
      <AdjacentYearMonthButton
        disabled={!nextYearMonth}
        yearMonth={nextYearMonth}
      >
        {t("nextMonth")}
      </AdjacentYearMonthButton>
    </>
  );
};

// https://nextjs.org/docs/pages/building-your-application/routing/internationalization#how-does-this-work-with-static-generation
export const getStaticPaths: GetStaticPaths<Params> = async ({ locales }) => {
  try {
    const fetchedEvents = await fetchEvents({ lang: "ja" });
    const eventsByMonth = groupEventsByYearMonth(fetchedEvents);
    const yearMonths = Object.keys(eventsByMonth);

    const paths = generateStaticPathsForLocales(
      yearMonths.map((yearMonth) => ({ params: { yearMonth } })),
      locales,
    );

    return { paths, fallback: true };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
  locale = DEFAULT_LOCALE,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const fetchedEvents = await fetchEvents({ lang: locale });
  const eventsByMonth = groupEventsByYearMonth(fetchedEvents);

  const yearMonth = params.yearMonth;

  if (!eventsByMonth[yearMonth]) {
    return {
      notFound: true,
    };
  }

  const events = eventsByMonth[yearMonth];
  const yearMonths = Object.keys(eventsByMonth);
  const currentIndex = yearMonths.indexOf(yearMonth);
  const nextYearMonth = yearMonths.at(currentIndex + 1) || "";
  const beforeYearMonth =
    yearMonths.at(currentIndex - 1) !== yearMonth &&
    yearMonths.at(currentIndex - 1) !== yearMonths.at(yearMonths.length - 1)
      ? yearMonths.at(currentIndex - 1)
      : "";

  const sortedData = events.sort(
    (a, b) =>
      convertToUTCDate(b.startedAt).getTime() -
      convertToUTCDate(a.startedAt).getTime(),
  );

  const latestYearMonth = Object.keys(eventsByMonth).sort().pop();

  const translations = await serverSideTranslations(locale, [
    "common",
    "events",
  ]);
  const { t } = getInitializedI18nInstance(translations);

  return {
    props: {
      ...translations,
      events: sortedData,
      lastUpdateDate: formatDate(getCurrentUTCDate(), "yyyy/MM/dd HH:mm"),
      beforeYearMonth: beforeYearMonth,
      nextYearMonth: nextYearMonth,
      currentYearMonth: yearMonth,
      latestYearMonth: latestYearMonth,
      meta: {
        title: t("title", { ns: "events" }),
        description: t("description", { ns: "events" }),
      },
    },
  };
};

const IndexPage: NextPageWithLayout<Props> = ({
  events,
  beforeYearMonth,
  nextYearMonth,
  currentYearMonth,
  latestYearMonth,
}) => {
  const router = useRouter();
  const todayEventRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");
  const locale = router.locale ?? DEFAULT_LOCALE;
  const { timeZone } = useTimeZoneContext();

  const matches = useMediaQuery("(max-width:600px)");
  const [searchText, setSearchText] = React.useState("");

  const filteredEvents = React.useMemo(() => {
    if (!searchText) return events;
    return events
      ? events.filter((event) =>
          event.title.toLowerCase().includes(searchText.toLowerCase()),
        )
      : [];
  }, [events, searchText]);

  let eventsByDate: EventsByDate = {};

  if (filteredEvents && filteredEvents.length > 0) {
    eventsByDate = filteredEvents.reduce(
      (acc: EventsByDate, event: VspoEvent) => {
        const date = event.startedAt.split("T")[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(event);
        return acc;
      },
      {} as EventsByDate,
    );
  }

  useEffect(() => {
    if (todayEventRef.current) {
      todayEventRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!events || events.length === 0) {
      router.replace(`/events/${latestYearMonth}`);
    }
  }, [events, router, latestYearMonth]);

  return (
    <>
      <Toolbar
        disableGutters
        sx={(theme) => ({
          justifyContent: "center",
          color: theme.vars.palette.text.primary,
        })}
      >
        <YearMonthSelector
          beforeYearMonth={beforeYearMonth}
          currentYearMonth={currentYearMonth}
          nextYearMonth={nextYearMonth}
        />
      </Toolbar>

      <Box sx={{ pt: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={t("search")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ marginBottom: "20px" }}
        />
        <Timeline position="right" sx={{ padding: "0px" }}>
          {Object.entries(eventsByDate).map(([date, eventsOnDate], index) => {
            const currentDate = getCurrentUTCDate();
            currentDate.setHours(0, 0, 0, 0);
            const isFutureEvent = convertToUTCDate(date) > currentDate;

            return (
              <TimelineItem key={index}>
                <TimelineOppositeContent
                  sx={{
                    maxWidth: matches ? "0px" : "140px",
                    textAlign: matches ? "left" : "right",
                    padding: matches ? "0px" : "20px",
                  }}
                >
                  <Typography
                    color="textSecondary"
                    variant="h6"
                    sx={{
                      marginLeft: matches ? "30px" : "0px",
                      width: matches ? "130px" : "100px",
                    }}
                  >
                    {formatDate(date, "MM/dd (E)", {
                      localeCode: locale,
                      timeZone,
                    })}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={isFutureEvent ? "success" : "grey"} />
                  {Object.entries(eventsByDate).length - 1 !== index && (
                    <TimelineConnector />
                  )}
                </TimelineSeparator>
                <TimelineContent sx={{ py: matches ? "40px" : "20px", px: 2 }}>
                  {eventsOnDate.map((event, eventIndex) => {
                    // TODO: Consider whether an event should hold time zone info
                    const eventDate = event.startedAt.split("T")[0]; // Get the date part of the ISO string
                    const today = formatDate(
                      getCurrentUTCDate(),
                      "yyyy-MM-dd",
                      { timeZone },
                    );
                    const isEventToday = eventDate === today;
                    return (
                      <React.Fragment key={eventIndex}>
                        {event.isNotLink ? (
                          <Card
                            sx={{
                              marginBottom: "20px",
                              border: isEventToday ? "2px solid red" : "none",
                            }}
                            ref={isEventToday ? todayEventRef : null}
                          >
                            <CardContent>
                              <Typography
                                variant="h6"
                                component="div"
                                align="left"
                                sx={{
                                  fontSize: matches ? "1.00rem" : "1.25rem",
                                }}
                              >
                                {event.title}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: "10px",
                                  marginTop: "10px",
                                }}
                              >
                                {members.map((member, index) => {
                                  const isMatch = member.keywords.some(
                                    (keyword) =>
                                      event.contentSummary.includes(keyword),
                                  );
                                  return (
                                    isMatch && (
                                      <StyledAvatar
                                        key={index}
                                        alt={member.name}
                                        src={member.iconUrl}
                                      />
                                    )
                                  );
                                })}
                              </Box>
                            </CardContent>
                          </Card>
                        ) : (
                          <Link href={`/events/details/${event.newsId}`}>
                            <Card
                              sx={{
                                marginBottom: "20px",
                                border: isEventToday ? "2px solid red" : "none",
                              }}
                              ref={isEventToday ? todayEventRef : null}
                            >
                              <CardContent>
                                <Typography
                                  variant="h6"
                                  component="div"
                                  align="left"
                                  sx={{
                                    fontSize: matches ? "1.00rem" : "1.25rem",
                                  }}
                                >
                                  {event.title}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "10px",
                                  }}
                                >
                                  {members.map((member, index) => {
                                    const isMatch = member.keywords.some(
                                      (keyword) =>
                                        event.contentSummary.includes(keyword),
                                    );
                                    return (
                                      isMatch && (
                                        <StyledAvatar
                                          key={index}
                                          alt={member.name}
                                          src={member.iconUrl}
                                        />
                                      )
                                    );
                                  })}
                                </Box>
                              </CardContent>
                            </Card>
                          </Link>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </Box>
    </>
  );
};

IndexPage.getLayout = (page, pageProps) => (
  <ContentLayout
    title={pageProps.meta?.title}
    description={pageProps.meta?.description}
    lastUpdateDate={pageProps.lastUpdateDate}
    path={`/events/${pageProps.currentYearMonth}`}
    maxPageWidth="md"
  >
    {page}
  </ContentLayout>
);

export default IndexPage;
