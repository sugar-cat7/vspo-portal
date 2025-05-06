import React from "react";
import { Box, Typography, List, ListItem, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Event } from "@/features/events/domain";
import { useTranslation } from "next-i18next";

const ContentSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EventsList = styled(List)({
  padding: 0,
});

const EventItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50],
  },
  transition: "background-color 0.2s ease",
}));

const EventTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

type PresenterProps = {
  events: Event[];
};

export const EventsContentPresenter: React.FC<PresenterProps> = ({
  events,
}) => {
  const { t } = useTranslation("streams");
  if (events.length === 0) {
    return <></>;
  }

  return (
    <ContentSection>
      <SectionHeader>
        <Typography
          variant="h5"
          sx={(theme) => ({
            fontWeight: 600,
            color: theme.palette.mode === "dark" ? "white" : "black",
          })}
        >
          {t("events")}
        </Typography>
      </SectionHeader>

      <Paper elevation={0}>
        <EventsList>
          {events.map((event) => (
            <EventItem key={event.id} divider>
              <EventTitle variant="body1">{event.title}</EventTitle>
            </EventItem>
          ))}
        </EventsList>
      </Paper>
    </ContentSection>
  );
};
