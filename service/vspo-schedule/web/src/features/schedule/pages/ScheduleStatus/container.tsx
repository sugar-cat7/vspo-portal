import { Event } from "@/features/events/domain";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/router";
import React, { useMemo, useState, useEffect } from "react";
import { Livestream } from "../../domain";
import { ScheduleStatusPresenter } from "./presenter";

// Props received from getServerSideProps
type ScheduleStatusContainerProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  events: Event[];
  initialDate?: string;
  timeZone: string;
  locale: string;
  error?: string;
  liveStatus?: string;
  isArchivePage?: boolean;
};

export const ScheduleStatusContainer: React.FC<
  ScheduleStatusContainerProps
> = ({
  livestreamsByDate,
  events,
  timeZone = "Asia/Tokyo", // Default to JST if not provided
  locale = "ja-JP", // Default to Japanese if not provided
  liveStatus = "all", // Default to all if not provided
  isArchivePage = false, // Default to false if not provided
}) => {
  // Validate status to make sure it's one of the valid values
  const validStatus = ["all", "live", "upcoming"].includes(liveStatus)
    ? (liveStatus as "all" | "live" | "upcoming")
    : "all";

  const router = useRouter();
  const [currentStatusFilter, setCurrentStatusFilter] = useState<
    "live" | "upcoming" | "all"
  >(validStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  // Get first date for the All tab
  const firstDate = useMemo(() => {
    // Only calculate for All tab
    if (currentStatusFilter !== "all") {
      return null;
    }

    // Get all dates sorted
    const dates = Object.keys(livestreamsByDate).sort();
    return dates.length > 0 ? dates[0] : null;
  }, [livestreamsByDate, currentStatusFilter]);

  // Format first date for display in All tab
  const formattedDate = useMemo(() => {
    if (!firstDate) {
      return "";
    }

    return formatDate(firstDate, "M/d", { localeCode: locale, timeZone });
  }, [firstDate, locale, timeZone]);

  // Filter livestreams based on the current status
  const filteredLivestreamsByDate = useMemo(() => {
    if (currentStatusFilter === "all") {
      return livestreamsByDate;
    }

    const filtered: Record<string, Livestream[]> = {};

    Object.entries(livestreamsByDate).forEach(([date, streams]) => {
      const filteredStreams = streams.filter((stream) => {
        if (currentStatusFilter === "live") {
          return stream.status === "live";
        }
        // At this point, currentStatusFilter must be 'upcoming'
        return stream.status === "upcoming";
      });

      if (filteredStreams.length > 0) {
        filtered[date] = filteredStreams;
      }
    });

    return filtered;
  }, [livestreamsByDate, currentStatusFilter]);

  // Setup router events for loading state
  useEffect(() => {
    const handleStart = (url: string) => {
      // Only set loading state for tab navigation
      if (url.includes("/schedule/")) {
        setIsLoading(true);
      }
    };

    const handleComplete = () => {
      setIsLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const handleStatusFilterChange = (status: "live" | "upcoming" | "all") => {
    if (status === currentStatusFilter) {
      return;
    }
    setCurrentStatusFilter(status);
    router.push(`/${locale}/schedule/${status}`, undefined, { shallow: false });
  };

  const handleSearchDialogOpen = () => {
    setIsSearchDialogOpen(true);
  };

  const handleSearchDialogClose = () => {
    setIsSearchDialogOpen(false);
  };

  // Prepare tab labels
  const allTabLabel =
    currentStatusFilter === "all" && formattedDate
      ? `すべて (${formattedDate})`
      : "すべて";

  return (
    <ScheduleStatusPresenter
      livestreamsByDate={filteredLivestreamsByDate}
      events={events}
      timeZone={timeZone}
      statusFilter={currentStatusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      isLoading={isLoading}
      isSearchDialogOpen={isSearchDialogOpen}
      onSearchDialogOpen={handleSearchDialogOpen}
      onSearchDialogClose={handleSearchDialogClose}
      allTabLabel={allTabLabel}
      isArchivePage={isArchivePage}
    />
  );
};
