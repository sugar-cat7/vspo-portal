import React, { useEffect, useState } from "react";
import { NextPageWithLayout } from "@/pages/_app";
import { ContentLayout } from "@/components/Layout";
import { Clip, Pagination } from "../../domain/clip";
import { Presenter } from "./presenter";

export type YouTubeClipsProps = {
  clips: Clip[];
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
  pagination: Pagination;
  order: string;
  orderKey: string;
  currentPeriod: string;
};

// Container component (page logic)
export const YouTubeClips: NextPageWithLayout<YouTubeClipsProps> = (props) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    setIsProcessing(false);
  }, [props.clips]);

  // Use the presenter component
  return (
    <Presenter
      clips={props.clips}
      pagination={props.pagination}
      orderKey={props.orderKey}
      isProcessing={isProcessing}
      currentPeriod={props.currentPeriod}
    />
  );
};

// Layout configuration
YouTubeClips.getLayout = (page, pageProps) => {
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
