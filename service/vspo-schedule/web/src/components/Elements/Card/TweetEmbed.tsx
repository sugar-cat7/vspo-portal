import { ThemeContext } from "@/context/Theme";
import { useContext } from "react";
import { Tweet, TweetNotFound } from "react-tweet";

type TweetEmbedProps = {
  tweetLink: string;
};

export const TweetEmbed: React.FC<TweetEmbedProps> = ({ tweetLink }) => {
  const tweetId = tweetLink.split("/").pop();
  const [mode] = useContext(ThemeContext);
  return (
    <div className={mode}>
      {tweetId ? <Tweet id={tweetId} /> : <TweetNotFound />}
    </div>
  );
};
