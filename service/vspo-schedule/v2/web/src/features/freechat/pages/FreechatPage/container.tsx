import React from "react";
import { Freechat } from "../../domain";
import { FreechatPagePresenter } from "./presenter";

type FreechatPageContainerProps = {
  freechats: Freechat[];
};

export const FreechatPageContainer: React.FC<FreechatPageContainerProps> = ({
  freechats,
}) => {
  return <FreechatPagePresenter freechats={freechats} />;
};
