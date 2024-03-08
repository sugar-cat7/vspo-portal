import React from "react";
import { styled, useColorScheme } from "@mui/material/styles";
import { Livestream, PlatformWithChat } from "@/types/streaming";
import { getChatEmbedUrl } from "@/lib/utils";
import { Loading } from "..";

const ResponsiveChatIframeWrapper = styled("div")({
  overflow: "hidden",
  width: "100%",
  height: "100%",
});

const ResponsiveChatIframe = styled("iframe")({
  width: "100%",
  height: "100%",
  border: "0",
});

export const ChatEmbed: React.FC<{
  livestream: Livestream & { platform: PlatformWithChat };
}> = ({ livestream }) => {
  const { colorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = React.useState(true);

  const isDarkMode = colorScheme === "dark";
  const chatEmbedUrl = getChatEmbedUrl(livestream, isDarkMode);

  return (
    <>
      {isLoading && <Loading />}
      <ResponsiveChatIframeWrapper
        style={{ display: isLoading ? "none" : "block" }}
      >
        <ResponsiveChatIframe
          src={chatEmbedUrl}
          title={`${livestream.platform} chat embed`}
          onLoad={() => setIsLoading(false)}
        />
      </ResponsiveChatIframeWrapper>
    </>
  );
};
