import React from "react";
import { Freechat } from "../../../shared/domain/freechat";
import { FreechatCardPresenter } from "../presenters/FreechatCardPresenter";

export type FreechatCardProps = {
  freechat: Freechat;
};

export const FreechatCard: React.FC<FreechatCardProps> = ({ freechat }) => {
  return <FreechatCardPresenter freechat={freechat} />;
};
