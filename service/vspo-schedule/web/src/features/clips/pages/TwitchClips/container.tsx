import React, { useEffect, useState } from "react";
import { NextPageWithLayout } from "@/pages/_app";
import { ContentLayout } from "@/components/Layout";
import { Presenter } from "./presenter";
import { Clip, Pagination } from "../../domain";

export type TwitchClipsProps = {
  clips: Clip[];
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
  pagination: Pagination;
  sortOption: string;
};

// Container component (page logic)
export const TwitchClips: NextPageWithLayout<TwitchClipsProps> = (props) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    setIsProcessing(false);
  }, [props.clips]);

  // Use the presenter component
  return (
    <Presenter
      clips={props.clips}
      pagination={props.pagination}
      sortOption={props.sortOption}
      isProcessing={isProcessing}
      setIsProcessing={setIsProcessing}
    />
  );
};

// Layout configuration
TwitchClips.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
      path="/twitch-clips"
    >
      {page}
    </ContentLayout>
  );
};
