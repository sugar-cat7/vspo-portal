import React, { useEffect, useState } from "react";
import { Container, Box, Tab, Tabs, IconButton } from "@mui/material";
import { GetStaticPaths, GetStaticProps } from "next";
import { Livestream } from "@/types/streaming";
import {
  formatWithTimeZone,
  getOneWeekRange,
  groupBy,
  isStatusLive,
  removeDuplicateTitles,
} from "@/lib/utils";
import { styled } from "@mui/system";
import { TabContext } from "@mui/lab";
import { ArrowBackIos } from "@mui/icons-material";
import { ContentLayout } from "@/components/Layout/ContentLayout";
import { NextPageWithLayout } from "./../_app";
import { Loading, SerarchDialog } from "@/components/Elements";
import { LivestreamCards } from "@/components/Templates";
import { freeChatVideoIds } from "@/data/master";
import { CustomBottomNavigation } from "@/components/Layout/Navigation";
import { fetchVspoEvents, fetchVspoLivestreams } from "@/lib/api";
import { VspoEvent } from "@/types/events";
import { usePathname } from "next/navigation";

type LivestreamsProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  eventsByDate: Record<string, VspoEvent[]>;
  lastUpdateDate: string;
  liveStatus?: string | string[];
};

const ContainerBox = styled(Box)(() => ({
  paddingTop: "50px",
}));

const TabBox = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: "divider",
  top: "64px",
  zIndex: "1000",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  justifyContent: "center",
  position: "sticky",

  [theme.breakpoints.down("sm")]: {
    top: "56px",
  },
}));

const HomePage: NextPageWithLayout<LivestreamsProps> = ({
  livestreamsByDate,
  lastUpdateDate,
  eventsByDate,
}) => {
  const [tabValue, setTabValue] = useState("0");
  const pathname = usePathname();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };
  const moveTab = (direction: string) => {
    const currentIndex = parseInt(tabValue);
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < dates.length) {
      setTabValue(newIndex.toString());
    }
  };

  const [dates, setDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filteredLivestreamsByDate, setFilteredLivestreamsByDate] =
    useState<Record<string, Livestream[]>>(livestreamsByDate);

  useEffect(() => {
    setIsLoading(true);
    if (dates.length > 0) {
      const todayIndex = dates.findIndex(
        (date) =>
          formatWithTimeZone(new Date(date), "ja", "yyyy/MM/dd") ===
          formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd")
      );
      if (todayIndex !== -1) {
        setTabValue(todayIndex.toString());
      }
    }
    setIsLoading(false);
  }, [dates]);

  useEffect(() => {
    setIsLoading(true);
    const dates = Object.keys(filteredLivestreamsByDate);
    const todayIndex = dates.findIndex(
      (date) =>
        formatWithTimeZone(new Date(date), "ja", "yyyy/MM/dd") ===
        formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd")
    );
    if (todayIndex !== -1) {
      setTabValue(todayIndex.toString());
    } else {
      setTabValue((dates.length <= 0 ? 0 : dates.length - 1).toString());
    }
    setDates(dates);
    setIsLoading(false);
    console.log(pathname);
  }, [filteredLivestreamsByDate, pathname]);
  useEffect(() => {
    setFilteredLivestreamsByDate(livestreamsByDate);
  }, [pathname, livestreamsByDate]);
  return (
    <>
      <Container>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {Object.entries(filteredLivestreamsByDate).length === 0 ? (
              <ContainerBox mt={4}>対象の配信はありません。</ContainerBox>
            ) : (
              <Box mt={4}>
                <TabContext value={tabValue}>
                  {/* Date */}
                  <TabBox>
                    <IconButton
                      onClick={() => moveTab("left")}
                      disabled={tabValue === "0"}
                    >
                      <ArrowBackIos />
                    </IconButton>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      textColor="primary"
                      indicatorColor="primary"
                      scrollButtons="auto"
                    >
                      {Object.entries(filteredLivestreamsByDate).map(
                        ([date], index) => (
                          <Tab
                            key={date}
                            label={formatWithTimeZone(
                              new Date(date),
                              "ja",
                              "MM/dd (E)"
                            )}
                            value={index.toString()}
                            sx={{
                              fontFamily: "Roboto, sans-serif",
                              textAlign: "center",
                              fontWeight: "700",
                            }}
                          />
                        )
                      )}
                    </Tabs>
                    <IconButton
                      onClick={() => moveTab("right")}
                      disabled={tabValue === (dates.length - 1).toString()}
                    >
                      <ArrowBackIos sx={{ transform: "rotate(180deg)" }} />
                    </IconButton>
                  </TabBox>
                  {/* Stream Content */}
                  <LivestreamCards
                    livestreamsByDate={filteredLivestreamsByDate}
                    eventsByDate={eventsByDate}
                  />
                </TabContext>
              </Box>
            )}
          </>
        )}
      </Container>
      <SerarchDialog
        livestreamsByDate={livestreamsByDate}
        setFilteredLivestreamsByDate={setFilteredLivestreamsByDate}
        searchTarget="livestream"
        setIsProcessing={setIsLoading}
      />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = ["all", "live", "upcoming", "archive"].map((status) => ({
    params: { status },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<LivestreamsProps> = async ({
  params,
}) => {
  const pastLivestreams = await fetchVspoLivestreams({ limit: 300 });

  const fetchEvents = await fetchVspoEvents();

  const uniqueLivestreams = removeDuplicateTitles(pastLivestreams);

  const { oneWeekAgo, oneWeekLater } = getOneWeekRange();
  const filteredLivestreams = uniqueLivestreams.filter((livestream) => {
    const scheduledStartTime = new Date(livestream.scheduledStartTime);
    scheduledStartTime.setHours(0, 0, 0, 0); // Set time to 00:00:00
    const isAll = params?.status === "all";
    return (
      scheduledStartTime >= oneWeekAgo &&
      scheduledStartTime <= oneWeekLater &&
      !freeChatVideoIds.includes(livestream.id) &&
      (isAll || params?.status === isStatusLive(livestream))
    );
  });
  // Sort livestreams by scheduled start time in ascending order
  filteredLivestreams.sort((a, b) => {
    return (
      new Date(a.scheduledStartTime).getTime() -
      new Date(b.scheduledStartTime).getTime()
    );
  });
  const livestreamsByDate = groupBy(filteredLivestreams, (livestream) => {
    try {
      return formatWithTimeZone(
        livestream.scheduledStartTime,
        "ja",
        "yyyy/MM/dd"
      );
    } catch (err) {
      console.error("Invalid date:", livestream.scheduledStartTime);
      throw err;
    }
  });

  const fetchEventsByDate = groupBy(fetchEvents, (event) => {
    try {
      return formatWithTimeZone(event.startedAt, "ja", "yyyy/MM/dd");
    } catch (err) {
      console.error("Invalid date:", event.startedAt);
      throw err;
    }
  });
  return {
    props: {
      livestreamsByDate: livestreamsByDate,
      eventsByDate: fetchEventsByDate,
      lastUpdateDate: formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd HH:mm"),
      liveStatus: params?.status,
    },
    revalidate: 30,
  };
};

HomePage.getLayout = (page, pageProps) => {
  let title = "";
  switch (pageProps.liveStatus) {
    case "all":
      title = "配信スケジュール";
      break;
    case "live":
      title = "配信中";
      break;
    case "upcoming":
      title = "配信予定";
      break;
    case "archive":
      title = "アーカイブ";
      break;
    default:
      title = "配信スケジュール";
      break;
  }
  return (
    <ContentLayout
      title={`ぶいすぽっ!${title}`}
      description={`ぶいすぽっ!メンバーの配信スケジュール(Youtube/Twitch/ツイキャス)を確認できます。`}
      lastUpdateDate={pageProps.lastUpdateDate}
      footerMessage="※メン限の配信は掲載していません。"
    >
      {page}
      <CustomBottomNavigation />
    </ContentLayout>
  );
};

export default HomePage;
