import { Livestream } from "@/features/schedule/domain";
import { formatDate } from "@/lib/utils";
import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { groupLivestreamsByTimeBlock } from "../../utils";
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

export const LivestreamContentPresenter: React.FC<LivestreamContentProps> = ({
  livestreamsByDate,
  timeZone,
}) => {
  const livestreamsByTimeBlock = groupLivestreamsByTimeBlock(
    livestreamsByDate,
    timeZone,
  );

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
