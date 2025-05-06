import React from "react";
import { FreechatPagePresenter } from "./presenter";
import { Freechat } from "../../domain";

type FreechatPageContainerProps = {
  freechats: Freechat[];
};

export const FreechatPageContainer: React.FC<FreechatPageContainerProps> = ({
  freechats,
}) => {
  return <FreechatPagePresenter freechats={freechats} />;
};
