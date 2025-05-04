import { Channel } from "@/features/clips/domain";
import React from "react";
import { MemberStoriesPresenter } from "../presenters/MemberStoriesPresenter";

export type MemberStoriesProps = {
  vspoMembers: Channel[];
};

export const MemberStories: React.FC<MemberStoriesProps> = ({
  vspoMembers,
}) => {
  return <MemberStoriesPresenter vspoMembers={vspoMembers} />;
};
