import React from "react";
import {
  LivestreamContent,
  EventsContent,
  DateSearchDialogContainer,
} from "./components";
import { Box, Fab, Tabs, Tab, Paper } from "@mui/material";
import { useTranslation } from "next-i18next";
import SearchIcon from "@mui/icons-material/Search";
import { Livestream } from "../../domain";
import { Event } from "@/features/events/domain";
import { styled } from "@mui/material/styles";
import { Loading } from "@/features/shared/components/Elements/Loading/Loading";

// Header height estimation (adjust if needed based on your actual header height)
const HEADER_HEIGHT = "54px";

const FixedTabsContainer = styled(Paper)(({ theme }) => ({
  position: "sticky",
  top: HEADER_HEIGHT, // Stick to the position right below the header
  zIndex: 1100,
  width: "100%",
  backgroundColor: theme.palette.background.paper,
}));

type PresenterProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  events: Event[];
  timeZone: string;
  statusFilter: "live" | "upcoming" | "all";
  onStatusFilterChange: (status: "live" | "upcoming" | "all") => void;
  isLoading: boolean;
  isSearchDialogOpen: boolean;
  onSearchDialogOpen: () => void;
  onSearchDialogClose: () => void;
  allTabLabel: string;
  isArchivePage?: boolean;
};

export const ScheduleStatusPresenter: React.FC<PresenterProps> = ({
  livestreamsByDate,
  events,
  timeZone,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  isSearchDialogOpen,
  onSearchDialogOpen,
  onSearchDialogClose,
  allTabLabel,
  isArchivePage = false,
}) => {
  const { t } = useTranslation("streams");

  return (
    <Box sx={{ position: "relative", pb: 4 }}>
      {!isArchivePage && (
        <FixedTabsContainer elevation={2}>
          <Tabs
            value={statusFilter}
            onChange={(_, newValue) =>
              onStatusFilterChange(newValue as "all" | "live" | "upcoming")
            }
            aria-label="livestream status tabs"
            variant="fullWidth"
          >
            <Tab label={allTabLabel} value="all" />
            <Tab label={t("status.live")} value="live" />
            <Tab label={t("status.upcoming")} value="upcoming" />
          </Tabs>
        </FixedTabsContainer>
      )}

      {isLoading ? (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Loading />
        </Box>
      ) : (
        <>
          <EventsContent events={events} />
          <LivestreamContent
            livestreamsByDate={livestreamsByDate}
            timeZone={timeZone}
          />
        </>
      )}

      {/* Floating search button */}
      <Fab
        color="primary"
        aria-label={t("search.dateSearch", "Search by Date")}
        onClick={onSearchDialogOpen}
        sx={{
          position: "fixed",
          bottom: 72,
          right: 32,
          zIndex: 1000,
          boxShadow: 3,
        }}
      >
        <SearchIcon />
      </Fab>

      <DateSearchDialogContainer
        open={isSearchDialogOpen}
        onClose={onSearchDialogClose}
      />
    </Box>
  );
};
