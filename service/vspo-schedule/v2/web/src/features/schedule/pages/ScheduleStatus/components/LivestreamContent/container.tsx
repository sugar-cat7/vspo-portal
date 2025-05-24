import { LivestreamContentPresenter } from "@/features/schedule/pages/ScheduleStatus/components/LivestreamContent/presenter";
import { Event } from "@/features/shared/domain";
import { Livestream } from "@/features/shared/domain/livestream";
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
