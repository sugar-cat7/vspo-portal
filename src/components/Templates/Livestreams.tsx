// components/ClipTabs.tsx
import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { Livestream } from "@/types/streaming";
import { formatWithTimeZone, groupLivestreamsByTimeRange } from "@/lib/utils";
import { TabPanel } from "@mui/lab";
import { LivestreamCard } from "../Elements";
import { styled } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { VspoEvent } from "@/types/events";
import { members } from "@/data/members";
import Link from "next/link";

type Props = {
  livestreamsByDate: Record<string, Livestream[]>;
  eventsByDate: Record<string, VspoEvent[]>;
};

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  width: "100%",
  backgroundColor:
    theme.palette.mode === "dark" ? "#353535" : "rgb(45, 75, 112)",
  color: "white",
  fontWeight: "bold",
  borderRadius: "4px",
}));

const DateTypography = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "center",
  backgroundColor:
    theme.palette.mode === "dark" ? "#353535" : "rgb(45, 75, 112)",
  color: "white",
  fontWeight: "bold",
  padding: "0.75rem",
  borderRadius: "4px",
}));

const TimeRangeLabel = styled(Typography)(({ theme }) => ({
  width: "12rem",
  color: "rgb(255, 255, 255)",
  fontSize: "1.5rem",
  fontWeight: 600,
  textAlign: "center",
  background: theme.palette.mode === "dark" ? "#353535" : "rgb(45, 75, 112)",
  borderRadius: "1.35rem",
  marginBottom: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    width: "10rem",
    fontSize: "1.2rem",
  },
  [theme.breakpoints.down("xs")]: {
    width: "8rem",
    fontSize: "1rem",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 24,
  height: 24,
  [theme.breakpoints.down("sm")]: {
    width: 20,
    height: 20,
  },
}));

export const LivestreamCards: React.FC<Props> = ({
  livestreamsByDate,
  eventsByDate,
}) => {
  // const [isEmbedMode] = useContext(EmbedModeContext);
  const [expanded, setExpanded] = React.useState<boolean>(true);
  return (
    <>
      {Object.entries(livestreamsByDate).map(([date, livestreams], index) => {
        const livestreamsByTimeRange = groupLivestreamsByTimeRange(livestreams);

        let events: VspoEvent[] = [];
        if (date in eventsByDate) {
          events = eventsByDate[date];
        }

        return (
          <TabPanel
            key={date}
            value={index.toString()}
            sx={{ padding: 0, fontFamily: "Roboto, sans-serif" }}
          >
            <Box
              key={date}
              sx={{
                margin: "5rem 0",
              }}
            >
              {events.length > 0 && (
                <StyledAccordion
                  sx={{ margin: "20px 0" }}
                  expanded={expanded}
                  onChange={() => setExpanded((prev) => !prev)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        fontWeight: "bold",
                      }}
                    >
                      イベント一覧
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: "transparent" }}>
                    {events.map((event, index) => (
                      <Box
                        display="flex"
                        sx={{
                          gap: "10px",
                          marginBottom: "10px",
                          flexDirection: "column",
                        }}
                        key={index}
                      >
                        {event.isNotLink ? (
                          <Typography
                            sx={{
                              fontSize: "16px",
                            }}
                          >
                            ・{event.title}
                          </Typography>
                        ) : (
                          <Link href={`/events/details/${event.newsId}`}>
                            <Typography
                              sx={{
                                fontSize: "16px",
                              }}
                            >
                              ・{event.title}
                            </Typography>
                          </Link>
                        )}
                        <Box
                          display="flex"
                          sx={{
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          {members.map(
                            (member, index) =>
                              event?.contentSummary.includes(
                                (member.name || "").replace(" ", "")
                              ) && (
                                <StyledAvatar
                                  key={index}
                                  alt={member.name}
                                  src={member.iconUrl}
                                />
                              )
                          )}
                        </Box>
                      </Box>
                    ))}
                  </AccordionDetails>
                </StyledAccordion>
              )}
              <DateTypography variant="h5" mb={3}>
                {formatWithTimeZone(new Date(date), "ja", "MM/dd (E)")}
                の配信一覧
              </DateTypography>
              {livestreamsByTimeRange.map(
                ({ label, livestreams }) =>
                  livestreams.length > 0 && (
                    <Box
                      key={label}
                      sx={{
                        marginBottom: "2rem",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {livestreams.length > 0 && (
                        <TimeRangeLabel variant="h6">{label}</TimeRangeLabel>
                      )}
                      {/* {isEmbedMode ? (
                        <Grid container spacing={2}>
                          {livestreams.map((livestream) => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={livestream.id}
                            >
                              <LivestreamCard livestream={livestream} />
                            </Grid>
                          ))}
                        </Grid>
                      ) : ( */}
                      <Grid container spacing={2}>
                        {livestreams.map((livestream) => (
                          <Grid
                            item
                            xs={6}
                            sm={6}
                            md={3}
                            lg={3}
                            key={livestream.id}
                          >
                            <LivestreamCard livestream={livestream} />
                          </Grid>
                        ))}
                      </Grid>
                      {/* )} */}
                    </Box>
                  )
              )}
            </Box>
          </TabPanel>
        );
      })}
    </>
  );
};
