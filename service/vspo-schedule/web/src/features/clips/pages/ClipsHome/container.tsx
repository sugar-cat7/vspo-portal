import { ContentLayout } from "@/components/Layout";
import { NextPageWithLayout } from "@/pages/_app";
import React, { useEffect, useState } from "react";
import { Channel, Clip } from "../../domain";
import { Presenter } from "./presenter";

export type ClipsHomeProps = {
  popularYoutubeClips: Clip[];
  popularShortsClips: Clip[];
  popularTwitchClips: Clip[];
  vspoMembers: Channel[];
  lastUpdateTimestamp: number;
  currentPeriod: string;
  meta: {
    title: string;
    description: string;
  };
};

// Container component (page logic)
export const ClipsHome: NextPageWithLayout<ClipsHomeProps> = (props) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    setIsProcessing(false);
  }, [
    props.popularYoutubeClips,
    props.popularShortsClips,
    props.popularTwitchClips,
  ]);

  // Use the presenter component
  return (
    <Presenter
      popularYoutubeClips={props.popularYoutubeClips}
      popularShortsClips={props.popularShortsClips}
      popularTwitchClips={props.popularTwitchClips}
      // vspoMembers={props.vspoMembers}
      isProcessing={isProcessing}
      currentPeriod={props.currentPeriod}
    />
  );
};

// Layout configuration
ClipsHome.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
      path="/clips"
    >
      {page}
    </ContentLayout>
  );
};
