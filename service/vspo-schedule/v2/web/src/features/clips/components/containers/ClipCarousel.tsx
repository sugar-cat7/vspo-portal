import { Clip } from "@/features/shared/domain";
import React from "react";
import { ClipCarouselPresenter } from "../presenters/ClipCarouselPresenter";

export type ClipCarouselProps = {
  clips: Clip[];
};

export const ClipCarousel: React.FC<ClipCarouselProps> = ({ clips }) => {
  return <ClipCarouselPresenter clips={clips} />;
};
