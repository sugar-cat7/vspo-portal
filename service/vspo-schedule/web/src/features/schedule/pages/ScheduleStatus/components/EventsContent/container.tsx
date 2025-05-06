import React from "react";
import { EventsContentPresenter } from "./presenter";
import { Event } from "@/features/events/domain";

type ContainerProps = {
  events: Event[];
};

export const EventsContentContainer: React.FC<ContainerProps> = ({
  events,
}) => {
  return <EventsContentPresenter events={events} />;
};
