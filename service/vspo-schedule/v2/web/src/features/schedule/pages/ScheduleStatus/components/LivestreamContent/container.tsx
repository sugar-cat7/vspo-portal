import { Event } from "@/features/events/domain";
import { Livestream } from "@/features/schedule/domain";
import { LivestreamContentPresenter } from "@/features/schedule/pages/ScheduleStatus/components/LivestreamContent/presenter";
import React from "react";

type LivestreamContentContainerProps = {
  livestreamsByDate: Record<string, Livestream[]>;
  events?: Event[];
  timeZone: string;
};

export const LivestreamContentContainer: React.FC<
  LivestreamContentContainerProps
> = ({ livestreamsByDate, timeZone }) => {
  return (
    <LivestreamContentPresenter
      livestreamsByDate={livestreamsByDate}
      timeZone={timeZone}
    />
  );
};
