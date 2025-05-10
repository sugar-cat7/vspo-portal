import { ContentLayout } from "@/components/Layout";
import { useTimeZoneContext } from "@/hooks";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { fetchEvents } from "@/lib/api";
import { convertToUTCDate, getCurrentUTCDate } from "@/lib/dayjs";
import {
  formatDate,
  generateStaticPathsForLocales,
  getInitializedI18nInstance,
  getRelevantMembers,
  groupEventsByYearMonth,
  matchesDateFormat,
} from "@/lib/utils";
import { VspoEvent } from "@/types/events";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetStaticPaths, GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";

type Params = {
  yearMonth: string;
};

type Props = {
  events: VspoEvent[];
  prevYearMonth?: string;
  currentYearMonth: string;
  nextYearMonth?: string;
  lastUpdateTimestamp: number;
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
  prevYearMonth?: string;
  currentYearMonth: string;
  nextYearMonth?: string;
}> = ({ prevYearMonth, currentYearMonth, nextYearMonth }) => {
  const { t } = useTranslation("events");

  return (
    <>
      <AdjacentYearMonthButton
        disabled={!prevYearMonth}
        yearMonth={prevYearMonth}
      >
        {t("prevMonth")}
      </AdjacentYearMonthButton>
      <Typography
        variant="h6"
        component="div"
        style={{ width: "160px", textAlign: "center" }}
      >
        {t("currMonth", { val: convertToUTCDate(currentYearMonth) })}
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
  const yearMonth = params?.yearMonth;
  const isValidYearMonth =
    yearMonth !== undefined && matchesDateFormat(yearMonth, "yyyy-MM");
  if (!isValidYearMonth) {
    return {
      notFound: true,
    };
  }
  const fetchedEvents = await fetchEvents({ lang: locale });
  if (fetchedEvents.length === 0) {
    return {
      notFound: true,
    };
  }

  const eventsByMonth = groupEventsByYearMonth(fetchedEvents);
  const events = eventsByMonth[yearMonth];
  const yearMonths = Object.keys(eventsByMonth);

  const lastYearMonth = yearMonths.at(-1)!;
  if (lastYearMonth < yearMonth) {
    // Param yearMonth is later than last yearMonth with events, so
    // redirect user to yearMonth containing last event
    return {
      redirect: {
        permanent: false,
        destination: `/${locale}/events/${lastYearMonth}`,
      },
    };
  }

  if (events === undefined) {
    // Param yearMonth has no events (but some future yearMonth has events), so
    // redirect user to yearMonth containing next upcoming event
    const upcomingEventYearMonth = yearMonths.find(
      (eventYearMonth) => yearMonth < eventYearMonth,
    );
    return {
      redirect: {
        permanent: false,
        destination: `/${locale}/events/${upcomingEventYearMonth}`,
      },
    };
  }

  const currentIndex = yearMonths.indexOf(yearMonth);
  const prevYearMonth = yearMonths[currentIndex - 1];
  const nextYearMonth = yearMonths[currentIndex + 1];

  const sortedData = events.sort(
    (a, b) =>
      convertToUTCDate(b.startedAt).getTime() -
      convertToUTCDate(a.startedAt).getTime(),
  );

  const translations = await serverSideTranslations(locale, [
    "common",
    "events",
  ]);
  const { t } = getInitializedI18nInstance(translations);

  return {
    props: {
      ...translations,
      events: sortedData,
      ...(prevYearMonth && { prevYearMonth }),
      currentYearMonth: yearMonth,
      ...(nextYearMonth && { nextYearMonth }),
      lastUpdateTimestamp: getCurrentUTCDate().getTime(),
      meta: {
        title: t("title", { ns: "events" }),
        description: t("description", { ns: "events" }),
      },
    },
  };
};

const IndexPage: NextPageWithLayout<Props> = ({
  events,
  prevYearMonth,
  currentYearMonth,
  nextYearMonth,
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
          prevYearMonth={prevYearMonth}
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
                    variant="h6"
                    sx={{
                      color: "text.secondary",
                      marginLeft: matches ? "30px" : "0px",
                      width: matches ? "130px" : "100px",
                    }}
                  >
                    {formatDate(date, "MM/dd (E)", { localeCode: locale })}
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
                    const today = formatDate(
                      getCurrentUTCDate(),
                      "yyyy-MM-dd",
                      { timeZone },
                    );
                    const isEventToday = date === today;
                    const eventMembers = getRelevantMembers(
                      event.contentSummary,
                    );
                    const eventCard = (
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
                            sx={{
                              fontSize: matches ? "1.00rem" : "1.25rem",
                              textAlign: "left",
                            }}
                          >
                            {event.title}
                          </Typography>
                          {eventMembers.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "10px",
                              }}
                            >
                              {eventMembers.map((member, memberIndex) => (
                                <StyledAvatar
                                  key={memberIndex}
                                  alt={member.name}
                                  src={member.iconUrl}
                                />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                    return (
                      <React.Fragment key={eventIndex}>
                        {event.isNotLink ? (
                          eventCard
                        ) : (
                          <Link href={`/events/details/${event.newsId}`}>
                            {eventCard}
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
    lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
    path={`/events/${pageProps.currentYearMonth}`}
    maxPageWidth="md"
  >
    {page}
  </ContentLayout>
);

export default IndexPage;
