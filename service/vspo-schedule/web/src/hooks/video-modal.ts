import { VideoModalContext } from "@/context/VideoModalContext";
import { useContext } from "react";

export const useVideoModalContext = () => {
  const context = useContext(VideoModalContext);

  if (context === undefined) {
    throw new Error("Cannot access VideoModalContext outside of its provider");
  }
  return context;
};
