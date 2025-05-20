import { YouTubeClips } from "@/features/clips/pages/YouTubeClips/container";
import { getYouTubeClipsServerSideProps } from "@/features/clips/pages/YouTubeClips/serverSideProps";

export const getServerSideProps = getYouTubeClipsServerSideProps({
  type: "short",
});
export default YouTubeClips;
