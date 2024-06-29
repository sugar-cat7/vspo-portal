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
import { styled } from "@mui/material/styles";
import { Livestream } from "@/types/streaming";
import { groupLivestreamsByTimeRange } from "@/lib/utils";
import { LivestreamCard } from "../Elements";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { VspoEvent } from "@/types/events";
import { members } from "@/data/members";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { DEFAULT_LOCALE } from "@/lib/Const";

type Props = {
  livestreamsByDate: Record<string, Livestream[]>;
  eventsByDate: Record<string, VspoEvent[]>;
};

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  width: "100%",
  backgroundColor: "rgb(45, 75, 112)",
  color: "white",
  fontWeight: "bold",
  borderRadius: "4px",

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#353535",
  },
}));

const DateTypography = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "center",
  backgroundColor: "rgb(45, 75, 112)",
  color: "white",
  fontWeight: "bold",
  padding: "0.75rem",
  borderRadius: "4px",
  whiteSpace: "pre-line",

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#353535",
  },
}));

const TimeRangeLabel = styled(Typography)(({ theme }) => ({
  width: "12rem",
  color: "rgb(255, 255, 255)",
  fontSize: "1.5rem",
  fontWeight: 600,
  textAlign: "center",
  backgroundColor: "rgb(45, 75, 112)",
  borderRadius: "1.35rem",
  marginBottom: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#353535",
  },
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
  const router = useRouter();
  const { t } = useTranslation(["streams"]);
  const locale = router.locale ?? DEFAULT_LOCALE;
  const [expanded, setExpanded] = React.useState<boolean>(true);
  if (Object.keys(livestreamsByDate).length === 0) {
    return (
      <Box
        sx={{
          margin: "5rem 0",
        }}
      >
        <DateTypography variant="h5" mb={3}>
          {t("noLiveStreams")}
        </DateTypography>
      </Box>
    );
  }
  return (
    <>
      {Object.entries(livestreamsByDate).map(([date, livestreams]) => {
        const livestreamsByTimeRange = groupLivestreamsByTimeRange(
          livestreams,
          locale,
        );
        let events: VspoEvent[] = [];
        if (date in eventsByDate) {
          events = eventsByDate[date];
        }

        const formattedDate =
          livestreamsByDate[date].at(0)?.formattedDateString;

        return (
          <Box
            key={date}
            sx={{
              marginTop: 6,
              marginBottom: "5rem",
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
                    {t("events")}
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
                            event.contentSummary.includes(
                              (member.name || "").replace(" ", ""),
                            ) && (
                              <StyledAvatar
                                key={index}
                                alt={member.name}
                                src={member.iconUrl}
                              />
                            ),
                        )}
                      </Box>
                    </Box>
                  ))}
                </AccordionDetails>
              </StyledAccordion>
            )}
            <DateTypography variant="h5" mb={3}>
              {t("streamsOnDate", { date: formattedDate })}
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
                    <TimeRangeLabel variant="h6">{label}</TimeRangeLabel>
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
                  </Box>
                ),
            )}
          </Box>
        );
      })}
    </>
  );
};
