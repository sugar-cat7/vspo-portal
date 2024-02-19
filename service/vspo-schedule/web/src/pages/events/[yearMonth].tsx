import {
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
  Avatar,
  Box,
  TextField,
  Button,
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
import { formatWithTimeZone, groupEventsByYearMonth } from "@/lib/utils";
import React, { useEffect } from "react";
import { fetchVspoEvents } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  events: VspoEvent[];
  lastUpdateDate: string;
  nextYearMonth?: string;
  beforeYearMonth?: string;
  currentYearMonth: string;
  latestYearMonth?: string;
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
}> = ({ beforeYearMonth, currentYearMonth, nextYearMonth }) => (
  <Box
    sx={(theme) => ({
      ...theme.mixins.toolbar,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      color: theme.vars.palette.text.primary,
    })}
  >
    <AdjacentYearMonthButton
      disabled={!beforeYearMonth}
      yearMonth={beforeYearMonth}
    >
      前の月へ
    </AdjacentYearMonthButton>
    <Typography
      variant="h6"
      component="div"
      style={{ width: "160px", textAlign: "center" }}
    >
      {currentYearMonth && currentYearMonth.replace("-", "年") + "月"}
    </Typography>
    <AdjacentYearMonthButton
      disabled={!nextYearMonth}
      yearMonth={nextYearMonth}
    >
      次の月へ
    </AdjacentYearMonthButton>
  </Box>
);

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const fetchEvents: VspoEvent[] = await fetchVspoEvents();
    const eventsByMonth = groupEventsByYearMonth(fetchEvents);

    const paths = Object.keys(eventsByMonth).map((yearMonth) => ({
      params: { yearMonth },
    }));

    return { paths, fallback: true };
  } catch (error) {
    console.error("Failed to fetch events in getStaticPaths", error);
    throw error;
  }
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  try {
    const fetchEvents: VspoEvent[] = await fetchVspoEvents();
    const eventsByMonth = groupEventsByYearMonth(fetchEvents);

    const yearMonth = context.params?.yearMonth;

    if (typeof yearMonth !== "string" || !eventsByMonth[yearMonth]) {
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
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

    const latestYearMonth = Object.keys(eventsByMonth).sort().pop();
    return {
      props: {
        events: sortedData,
        lastUpdateDate: formatWithTimeZone(
          new Date(),
          "ja",
          "yyyy/MM/dd HH:mm",
        ),
        beforeYearMonth: beforeYearMonth,
        nextYearMonth: nextYearMonth,
        currentYearMonth: yearMonth,
        latestYearMonth: latestYearMonth,
      },
    };
  } catch (error) {
    console.error("Failed to fetch events in getStaticProps", error);
    throw error;
  }
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
      <YearMonthSelector
        beforeYearMonth={beforeYearMonth}
        currentYearMonth={currentYearMonth}
        nextYearMonth={nextYearMonth}
      />

      <Container maxWidth="lg" sx={{ pt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="検索"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ marginBottom: "20px" }}
            />
            <Timeline position="right" sx={{ padding: "0px" }}>
              {Object.entries(eventsByDate).map(
                ([date, eventsOnDate], index) => {
                  const currentDate = new Date();
                  currentDate.setHours(0, 0, 0, 0);
                  const isFutureEvent = new Date(date) > currentDate;

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
                            width: "100px",
                          }}
                        >
                          {formatWithTimeZone(
                            new Date(date),
                            "ja",
                            "MM/dd (E)",
                          )}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot
                          color={isFutureEvent ? "success" : "grey"}
                        />
                        {Object.entries(eventsByDate).length - 1 !== index && (
                          <TimelineConnector />
                        )}
                      </TimelineSeparator>
                      <TimelineContent
                        sx={{ py: matches ? "40px" : "20px", px: 2 }}
                      >
                        {eventsOnDate.map((event, eventIndex) => {
                          const eventDate = event.startedAt.split("T")[0]; // Get the date part of the ISO string
                          const today = formatWithTimeZone(
                            new Date(),
                            "ja",
                            "yyyy-MM-dd",
                          );

                          const isEventToday = eventDate === today;
                          return (
                            <React.Fragment key={eventIndex}>
                              {event.isNotLink ? (
                                <Card
                                  sx={{
                                    marginBottom: "20px",
                                    border: isEventToday
                                      ? "2px solid red"
                                      : "none",
                                  }}
                                  ref={isEventToday ? todayEventRef : null}
                                >
                                  <CardContent>
                                    <Typography
                                      variant="h6"
                                      component="div"
                                      align="left"
                                      sx={{
                                        fontSize: matches
                                          ? "1.00rem"
                                          : "1.25rem",
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
                                      {members.map(
                                        (member, index) =>
                                          event.contentSummary.includes(
                                            member.name.replace(" ", ""),
                                          ) && (
                                            <StyledAvatar
                                              key={index}
                                              alt={member.name}
                                              src={member.iconUrl}
                                            />
                                          ),
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Link href={`/events/details/${event.newsId}`}>
                                  <Card
                                    sx={{
                                      marginBottom: "20px",
                                      border: isEventToday
                                        ? "2px solid red"
                                        : "none",
                                    }}
                                    ref={isEventToday ? todayEventRef : null}
                                  >
                                    <CardContent>
                                      <Typography
                                        variant="h6"
                                        component="div"
                                        align="left"
                                        sx={{
                                          fontSize: matches
                                            ? "1.00rem"
                                            : "1.25rem",
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
                                        {members.map(
                                          (member, index) =>
                                            event.contentSummary.includes(
                                              member.name.replace(" ", ""),
                                            ) && (
                                              <StyledAvatar
                                                key={index}
                                                alt={member.name}
                                                src={member.iconUrl}
                                              />
                                            ),
                                        )}
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
                },
              )}
            </Timeline>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
IndexPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title="ぶいすぽっ!イベント一覧"
      description="ぶいすぽっ!が関係するイベントをまとめています。"
      lastUpdateDate={pageProps.lastUpdateDate}
      path={`/events/${pageProps.currentYearMonth}`}
    >
      {page}
    </ContentLayout>
  );
};

export default IndexPage;
