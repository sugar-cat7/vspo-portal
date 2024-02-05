import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Avatar,
  Button,
  IconButton,
  Link,
  Tab,
  Tabs,
  BottomNavigation,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Clip, Livestream, Platform } from "@/types/streaming";
import {
  formatWithTimeZone,
  getLivestreamUrl,
  isStatusLive,
} from "@/lib/utils";
import { PlatformIcon } from "..";
import CloseIcon from "@mui/icons-material/Close";
import { members } from "@/data/members";
import ShareIcon from "@mui/icons-material/Share";
import { RelatedVideos } from "@/components/Templates";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Image from "next/image";
import { useRouter } from "next/router";

type LivestreamDetailsModalProps = {
  livestream?: Livestream;
  clip?: Clip;
  open: boolean;
  onClose: () => void;
  isDefaultEmbedMode?: boolean;
};

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: "#7266cf",
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
  padding: theme.spacing(1),
  color: "white",

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#212121",
  },
}));

const LiveLabel = styled("div")<{ isUpcoming?: boolean }>(
  ({ isUpcoming }) => ({
    width: "78px",
    color: "rgb(255, 255, 255)",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "Roboto, sans-serif",
    textAlign: "center",
    lineHeight: "24px",
    background: isUpcoming ? "rgb(45, 75, 112)" : "rgb(255, 0, 0)",
    borderRadius: "12px",
    marginRight: "2.0rem",
  })
);

const StyledDialogContent = styled(DialogContent)({
  overflow: "hidden",
  padding: "0",
});

const TypographySmallOnMobile = styled(Typography)(({ theme }) => ({
  // メディアクエリ: 幅600px以下の場合
  [theme.breakpoints.down("sm")]: {
    fontSize: "1rem",
  },
}));

const TypographySmallOnMobileDescription = styled(Typography)(({ theme }) => ({
  // メディアクエリ: 幅600px以下の場合
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
  },
}));

const ResponsiveIframeWrapper = styled("div")({
  overflow: "hidden",
  aspectRatio: "16/9",
});

const ResponsiveChatIframeWrapper = styled("div")({
  overflow: "hidden",
  width: "100%",
  height: "100%",
});

const ResponsiveIframe = styled("iframe")({
  width: "100%",
  height: "100%",
  border: "0",
});

const ResponsiveChatIframe = styled("iframe")({
  width: "100%",
  height: "100%",
  border: "0",
});

const VideoPlayerOrLinkComponent: React.FC<{
  url: string;
  livestream?: Livestream;
  clip?: Clip;
}> = ({ url, livestream, clip }) => {
  if (!livestream && !clip) return <></>;
  let embedUrl;
  if (livestream) {
    if (livestream.platform === Platform.YouTube) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (livestream.platform === Platform.Twitch) {
      const tid = !livestream?.twitchPastVideoId
        ? `channel=${livestream.twitchName}`
        : `video=${livestream.twitchPastVideoId}`;
      embedUrl = `https://player.twitch.tv/?${tid}&parent=${document.location.hostname}&autoplay=false`;
    } else if (livestream.platform === Platform.TwitCasting) {
      // Assuming livestream.id is the Twitcasting live id
      embedUrl = url;
    } else if (livestream.platform === Platform.NicoNico) {
      // Assuming livestream.id is the NicoNico live id
      embedUrl = `https://live.nicovideo.jp/embed/${livestream.id}/`;
    }
  } else if (clip) {
    if (clip.platform === Platform.YouTube) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (clip.platform === Platform.Twitch) {
      embedUrl = `https://clips.twitch.tv/embed?clip=${clip.id}&parent=${document.location.hostname}&autoplay=false`;
    }
  }
  return (
    <ResponsiveIframeWrapper>
      <ResponsiveIframe
        key={embedUrl}
        src={embedUrl}
        title={`${livestream?.platform || clip?.platform} video player`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        loading="lazy"
      />
    </ResponsiveIframeWrapper>
  );
};

const VideoPlayerOrLink = React.memo(VideoPlayerOrLinkComponent);

const YoutubeChatEmbed: React.FC<{ videoId: string }> = ({ videoId }) => {
  const chatEmbedUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;

  return (
    <ResponsiveChatIframeWrapper>
      <ResponsiveChatIframe
        key={chatEmbedUrl}
        src={chatEmbedUrl}
        title="Youtube chat embed"
        loading="lazy"
      />
    </ResponsiveChatIframeWrapper>
  );
};

interface TwitchChatEmbedProps {
  channelName: string;
}

const TwitchChatEmbed: React.FC<TwitchChatEmbedProps> = ({ channelName }) => {
  const chatEmbedUrl = `https://www.twitch.tv/embed/${channelName}/chat?parent=${window.location.hostname}`;

  return (
    <ResponsiveChatIframeWrapper>
      <ResponsiveChatIframe
        key={chatEmbedUrl}
        src={chatEmbedUrl}
        title="Twitch chat embed"
        loading="lazy"
      />
    </ResponsiveChatIframeWrapper>
  );
};

export const LivestreamDetailsModal: React.FC<LivestreamDetailsModalProps> = ({
  livestream,
  clip,
  open,
  onClose,
}) => {
  const router = useRouter();
  const url =
    livestream?.isTemp && livestream?.tempUrl
      ? livestream.tempUrl
      : livestream
      ? getLivestreamUrl({
          videoId: livestream.id,
          platform: livestream.platform,
          externalLink: livestream.link,
          memberName: livestream.channelTitle,
          twitchUsername: livestream?.twitchName,
          actualEndTime: livestream?.actualEndTime,
          twitchPastVideoId: livestream?.twitchPastVideoId,
        })
      : getLivestreamUrl({
          videoId: clip?.id || "",
          platform: clip?.platform || Platform.YouTube,
          isClip: true,
          externalLink: clip?.link,
        });

  const videoInfo = livestream || clip;
  if (!videoInfo) {
    return null;
  }

  const iconUrl = livestream
    ? livestream?.iconUrl
    : clip?.platform === Platform.Twitch
    ? members.filter((m) => m.twitchChannelId === clip.channelId).at(0)?.iconUrl
    : clip?.iconUrl;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
    >
      <StyledDialogTitle>
        <Box display="flex" alignItems="center">
          {/* <NextLink href="/"> */}
          <Box
            flexGrow={1}
            display="flex"
            alignItems="center"
            sx={{ gap: "10px", cursor: "pointer" }}
            onClick={() => router.push("/schedule/all")}
          >
            <Image
              src="/icon-top_transparent.png"
              alt="Page Icon"
              width={30}
              height={30}
            />
            <TypographySmallOnMobile
              sx={{ fontWeight: "bold", paddingTop: "3px" }}
            >
              すぽじゅーる
            </TypographySmallOnMobile>
          </Box>
          {/* </NextLink> */}
        </Box>
      </StyledDialogTitle>
      <StyledDialogContent
        sx={{
          display: "grid",
          grid: {
            // 2 rows, 1 col
            // InfoTabs fills vertical space left below VideoPlayerOrLink
            xs: "auto minmax(0, 1fr) / 1fr",
            // 1 row, 2 cols
            // VideoPlayerOrLink spans 2/3 dialog width, InfoTabs spans 1/3
            md: "minmax(0, 1fr) / 2fr 1fr",
          },
        }}
      >
        <VideoPlayerOrLink
          url={url}
          livestream={livestream}
          clip={clip}
        />
        <InfoTabs videoInfo={videoInfo} iconUrl={iconUrl} url={url} />
      </StyledDialogContent>
      <Box
        sx={{
          position: "absolute",
          top: 3,
          right: 0,
        }}
      >
        <IconButton
          onClick={() => {
            onClose();
            router.push("/");
          }}
        >
          <CloseIcon style={{ color: "white" }} />
        </IconButton>
      </Box>
      <BottomNavigation
        sx={{
          flex: "none",
          borderTop: "1px solid #ddd",
          height: "60px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <IconButton onClick={onClose} color="inherit">
          <ArrowBackIcon />
          <Typography>戻る</Typography>
        </IconButton>
        <Typography
          variant="body1"
          sx={{
            display: "-webkit-box",
            "-webkit-line-clamp": "2",
            "-webkit-box-orient": "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "80%", // 適宜調整してください
            textAlign: "left",
            paddingLeft: "8px",
            paddingRight: "8px",
          }}
        >
          {videoInfo.title}
        </Typography>
      </BottomNavigation>
    </Dialog>
  );
};

interface TabPanelProps {
  value: number;
  index: number;
  children: React.ReactNode;
}

const TabPanelScrollContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflowX: "hidden",
  overflowY: "auto",
  padding: theme.spacing(1),
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
}));

const TabPanel: React.FC<TabPanelProps> = ({ value, index, children }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`livestream tabpanel-${index}`}
      aria-labelledby={`livestream-tab-${index}`}
      style={{ flex: "1", overflow: "hidden" }}
    >
      {value === index && <TabPanelScrollContainer>{children}</TabPanelScrollContainer>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `livestream-tab-${index}`,
    "aria-controls": `livestream tabpanel-${index}`,
  };
};

const InfoTabs: React.FC<{
  videoInfo: Livestream | Clip;
  iconUrl?: string;
  url?: string;
}> = ({ videoInfo, iconUrl, url }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const formattedStartTime = formatWithTimeZone(
    videoInfo?.scheduledStartTime || videoInfo?.createdAt || "",
    "ja",
    "MM/dd HH:mm~"
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="livestream tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="概要" {...a11yProps(0)} />
          <Tab label="関連動画" {...a11yProps(1)} />
          {videoInfo?.platform === Platform.YouTube &&
            "actualEndTime" in videoInfo &&
            isStatusLive(videoInfo) === "live" && (
              <Tab label="ライブチャット" {...a11yProps(2)} />
            )}
          {videoInfo?.platform === Platform.Twitch &&
            "actualEndTime" in videoInfo && (
              <Tab label="チャット" {...a11yProps(2)} />
            )}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Box>
          <TypographySmallOnMobile variant="h5">
            {videoInfo.title}
          </TypographySmallOnMobile>
          <Box
            display="flex"
            justifyContent="flex-start"
            sx={{ marginTop: "10px" }}
          >
            <TypographySmallOnMobile sx={{ marginRight: "10px" }}>
              {formattedStartTime}
            </TypographySmallOnMobile>
            {"actualEndTime" in videoInfo && (
              <>
                {isStatusLive(videoInfo) === "live" && (
                  <LiveLabel>Live</LiveLabel>
                )}
                {isStatusLive(videoInfo) === "upcoming" && (
                  <LiveLabel isUpcoming>配信予定</LiveLabel>
                )}
              </>
            )}
          </Box>
        </Box>
        <Box>
          <Box display="flex" alignItems="center" mt={2} mb={2}>
            <Avatar src={iconUrl} />
            <TypographySmallOnMobile variant="h6" style={{ marginLeft: 8 }}>
              {videoInfo.channelTitle}
            </TypographySmallOnMobile>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            mt={2}
            mb={2}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              {url && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PlatformIcon platform={videoInfo.platform} />}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: "none", // 下線を削除する
                  }}
                >
                  視聴
                </Button>
              )}
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShareIcon />}
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: videoInfo.title!, // ここにビデオのタイトルを設定します
                        text: videoInfo.title!, // ここに共有するテキストを設定します
                        url: url, // ここにビデオのURLを設定します
                      });
                    } catch (error) {
                      console.error("Share failed:", error);
                    }
                  } else {
                    console.log(
                      "Your system does not support the Web Share API"
                    );
                  }
                }}
              >
                共有
              </Button>
            </Box>
          </Box>
        </Box>
        <TypographySmallOnMobileDescription variant="body1">
          {videoInfo.description.split("\n").map((text, index) => {
            const isUrl =
              text.startsWith("http://") || text.startsWith("https://");
            if (isUrl) {
              return (
                <Link
                  href={text}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                >
                  {text}
                </Link>
              );
            } else {
              return (
                <React.Fragment key={index}>
                  {text}
                  <br />
                </React.Fragment>
              );
            }
          })}
        </TypographySmallOnMobileDescription>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RelatedVideos
          channnelId={videoInfo.channelId}
          videoId={videoInfo.id}
        />
      </TabPanel>
      {videoInfo?.platform === Platform.YouTube &&
        "actualEndTime" in videoInfo &&
        isStatusLive(videoInfo) === "live" && (
          <TabPanel value={value} index={2}>
            <YoutubeChatEmbed videoId={videoInfo?.id} />
          </TabPanel>
        )}
      {videoInfo?.platform === Platform.Twitch &&
        "actualEndTime" in videoInfo && (
          <TabPanel value={value} index={2}>
            <TwitchChatEmbed channelName={videoInfo.twitchName!} />
          </TabPanel>
        )}
    </Box>
  );
};
