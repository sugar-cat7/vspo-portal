import { Event } from "@/features/shared/domain";
import React from "react";
import { EventsContentPresenter } from "./presenter";

type ContainerProps = {
  events: Event[];
};

export const EventsContentContainer: React.FC<ContainerProps> = ({
  events,
}) => {
  return <EventsContentPresenter events={events} />;
};
