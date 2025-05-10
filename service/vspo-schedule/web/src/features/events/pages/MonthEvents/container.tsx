import { ContentLayout } from "@/features/shared/components/Layout";
import { NextPageWithLayout } from "@/pages/_app";
import React, { useState, useEffect, useMemo } from "react";
import { Event } from "../../domain";
import { Presenter } from "./presenter";
import dayjs from "dayjs";

export type MonthEventsProps = {
  events: Event[];
  yearMonth: string;
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
};

// Container component (page logic)
export const MonthEvents: NextPageWithLayout<MonthEventsProps> = (props) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  // Handle search text changes
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  // Calculate previous and next month
  const adjacentMonths = useMemo(() => {
    const current = dayjs(props.yearMonth);
    const prevMonth = current.subtract(1, "month");
    const nextMonth = current.add(1, "month");

    return {
      prevYearMonth: prevMonth.format("YYYY-MM"),
      nextYearMonth: nextMonth.format("YYYY-MM"),
    };
  }, [props.yearMonth]);

  useEffect(() => {
    setIsProcessing(false);
  }, [props.events]);

  // Use the presenter component
  return (
    <Presenter
      events={props.events}
      currentYearMonth={props.yearMonth}
      prevYearMonth={adjacentMonths.prevYearMonth}
      nextYearMonth={adjacentMonths.nextYearMonth}
      isProcessing={isProcessing}
      searchText={searchText}
      onSearchChange={handleSearchChange}
    />
  );
};

// Layout configuration
MonthEvents.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
      path={`/events/${pageProps.yearMonth}`}
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};
