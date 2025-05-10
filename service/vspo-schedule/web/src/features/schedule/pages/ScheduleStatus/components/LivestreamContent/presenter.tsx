import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { formatDate } from "@/lib/utils";
import { Livestream } from "@/features/schedule/domain";
import { LivestreamCard } from "./LivestreamCard";

const ContentSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
}));

const DateHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const LivestreamGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const TimeBlockHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(2),
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  display: "flex",
  alignItems: "center",
}));

type LivestreamContentProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  timeZone: string;
};

// Time blocks for grouping livestreams
const TIME_BLOCKS = [
  { start: 0, end: 6, label: "00:00 - 06:00" },
  { start: 6, end: 12, label: "06:00 - 12:00" },
  { start: 12, end: 18, label: "12:00 - 18:00" },
  { start: 18, end: 24, label: "18:00 - 00:00" },
];

// Group livestreams by date and time block
const groupLivestreamsByTimeBlock = (
  livestreamsByDate: Record<string, Livestream[]>,
): Record<string, Record<string, Livestream[]>> => {
  const result: Record<string, Record<string, Livestream[]>> = {};

  Object.entries(livestreamsByDate).forEach(([date, livestreams]) => {
    result[date] = {};

    // Initialize all time blocks
    TIME_BLOCKS.forEach((block) => {
      result[date][block.label] = [];
    });

    // Sort livestreams into time blocks
    livestreams.forEach((livestream) => {
      const startTime = new Date(livestream.scheduledStartTime);
      const hours = startTime.getHours();

      for (const block of TIME_BLOCKS) {
        if (hours >= block.start && hours < block.end) {
          result[date][block.label].push(livestream);
          break;
        }
      }
    });

    // Remove empty time blocks
    Object.keys(result[date]).forEach((blockLabel) => {
      if (result[date][blockLabel].length === 0) {
        delete result[date][blockLabel];
      }
    });

    // Remove dates with no livestreams in any time block
    if (Object.keys(result[date]).length === 0) {
      delete result[date];
    }
  });

  return result;
};

export const LivestreamContentPresenter: React.FC<LivestreamContentProps> = ({
  livestreamsByDate,
  timeZone,
}) => {
  const livestreamsByTimeBlock = groupLivestreamsByTimeBlock(livestreamsByDate);

  return (
    <Box sx={{ py: 2 }}>
      {Object.entries(livestreamsByTimeBlock).map(([date, timeBlocks]) => (
        <ContentSection key={date}>
          <DateHeader>
            <Typography
              variant="h5"
              sx={(theme) => ({
                fontWeight: 600,
                color: theme.palette.mode === "dark" ? "white" : "black",
              })}
            >
              {formatDate(date, "MM/dd (EEE)")}
            </Typography>
          </DateHeader>

          {Object.entries(timeBlocks).map(([timeBlock, livestreams]) => (
            <Box key={`${date}-${timeBlock}`}>
              <TimeBlockHeader sx={{ mx: 2, mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  {timeBlock}
                </Typography>
              </TimeBlockHeader>

              <LivestreamGrid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                {livestreams.map((livestream) => (
                  <Grid item xs={6} sm={6} md={4} key={livestream.id}>
                    <LivestreamCard
                      livestream={livestream}
                      isFreechat={false}
                      timeZone={timeZone}
                    />
                  </Grid>
                ))}
              </LivestreamGrid>
            </Box>
          ))}
        </ContentSection>
      ))}
    </Box>
  );
};
