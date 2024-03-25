import { createContext, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Video } from "@/types/streaming";

const VideoModal = dynamic(
  () => import("../components/Elements").then((mod) => mod.VideoModal),
  { ssr: false },
);

type ContextProps = {
  activeVideo: Video | undefined;
  pushVideo: (video: Video) => void;
  popVideo: () => void;
  clearVideos: () => void;
};

export const VideoModalContext = createContext<ContextProps | undefined>(
  undefined,
);

export const VideoModalContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [history, setHistory] = useState<Video[]>([]);

  const pushVideo = useCallback((video: Video) => {
    setHistory((history) => [...history, video]);
  }, []);
  const popVideo = useCallback(() => {
    setHistory((history) => history.slice(0, -1));
  }, []);
  const clearVideos = useCallback(() => {
    setHistory([]);
  }, []);

  const activeVideo = history.at(-1);

  return (
    <VideoModalContext.Provider
      value={{
        activeVideo,
        pushVideo,
        popVideo,
        clearVideos,
      }}
    >
      <VideoModal />
      {children}
    </VideoModalContext.Provider>
  );
};
