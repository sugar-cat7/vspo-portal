import { TwitchClips } from "@/features/clips/pages/TwitchClips/container";
import { getTwitchClipsServerSideProps } from "@/features/clips/pages/TwitchClips/serverSideProps";

export const getServerSideProps = getTwitchClipsServerSideProps;
export default TwitchClips;
