import { Tweet, TweetNotFound } from "react-tweet";
import { useColorScheme } from "@mui/material/styles";

type TweetEmbedProps = {
  tweetLink: string;
};

export const TweetEmbed: React.FC<TweetEmbedProps> = ({ tweetLink }) => {
  const tweetId = tweetLink.split("/").pop();
  const { mode } = useColorScheme();
  return (
    <div className={mode}>
      {tweetId ? <Tweet id={tweetId} /> : <TweetNotFound />}
    </div>
  );
};
