import React from "react";
import { LivestreamContentPresenter } from "@/features/schedule/pages/ScheduleStatus/components/LivestreamContent/presenter";
import { Livestream } from "@/features/schedule/domain";
import { Event } from "@/features/events/domain";

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
