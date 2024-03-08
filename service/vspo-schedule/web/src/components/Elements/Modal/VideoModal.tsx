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
import { Video } from "@/types/streaming";
import {
  formatWithTimeZone,
  getLiveStatus,
  getVideoEmbedUrl,
  getVideoIconUrl,
  getVideoUrl,
  isLivestream,
  isOnPlatformWithChat,
} from "@/lib/utils";
import { PlatformIcon } from "..";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import { RelatedVideos } from "@/components/Templates";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChatEmbed } from "../ChatEmbed";

type VideoModalProps = {
  video: Video;
  open: boolean;
  onClose: () => void;
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

const LiveLabel = styled("div")<{
  isUpcoming?: boolean;
}>(({ isUpcoming }) => ({
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
}));

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
  whiteSpace: "pre-wrap",

  // メディアクエリ: 幅600px以下の場合
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
  },
}));

const ResponsiveIframeWrapper = styled("div")(({ theme }) => ({
  overflow: "hidden",

  [theme.breakpoints.down("md")]: {
    aspectRatio: "16/9",
  },
}));

const ResponsiveIframe = styled("iframe")({
  width: "100%",
  height: "100%",
  border: "0",
});

const VideoPlayerComponent: React.FC<{ video: Video }> = ({ video }) => {
  const embedUrl = getVideoEmbedUrl(video);
  return (
    <ResponsiveIframeWrapper>
      <ResponsiveIframe
        key={embedUrl}
        src={embedUrl}
        title={`${video.platform} video player`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        loading="lazy"
      />
    </ResponsiveIframeWrapper>
  );
};

const VideoPlayer = React.memo(VideoPlayerComponent);

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
  ...theme.mixins.scrollbar,
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
      {value === index && (
        <TabPanelScrollContainer>{children}</TabPanelScrollContainer>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `livestream-tab-${index}`,
    "aria-controls": `livestream tabpanel-${index}`,
  };
};

const InfoTabs: React.FC<{ video: Video }> = ({ video }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const formattedStartTime = formatWithTimeZone(
    video.scheduledStartTime || video.createdAt || "",
    "ja",
    "MM/dd HH:mm~",
  );
  const showChatTab =
    isLivestream(video) &&
    isOnPlatformWithChat(video) &&
    getLiveStatus(video) === "live";
  const url = getVideoUrl(video);
  const iconUrl = getVideoIconUrl(video);
  const urlRegex = /(https?:\/\/\S+)/;

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
          {showChatTab && <Tab label="ライブチャット" {...a11yProps(2)} />}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Box>
          <TypographySmallOnMobile variant="h5">
            {video.title}
          </TypographySmallOnMobile>
          <Box
            display="flex"
            justifyContent="flex-start"
            sx={{ marginTop: "10px" }}
          >
            <TypographySmallOnMobile sx={{ marginRight: "10px" }}>
              {formattedStartTime}
            </TypographySmallOnMobile>
            {isLivestream(video) && (
              <>
                {getLiveStatus(video) === "live" && <LiveLabel>Live</LiveLabel>}
                {getLiveStatus(video) === "upcoming" && (
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
              {video.channelTitle}
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
                  startIcon={<PlatformIcon platform={video.platform} />}
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
                        title: video.title, // ここにビデオのタイトルを設定します
                        text: video.title, // ここに共有するテキストを設定します
                        url: url, // ここにビデオのURLを設定します
                      });
                    } catch (error) {
                      console.error("Share failed:", error);
                    }
                  } else {
                    console.log(
                      "Your system does not support the Web Share API",
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
          {video.description.split(urlRegex).map((text, index) => {
            if (index % 2 === 0) {
              return <React.Fragment key={index}>{text}</React.Fragment>;
            }
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
          })}
        </TypographySmallOnMobileDescription>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RelatedVideos channelId={video.channelId} videoId={video.id} />
      </TabPanel>
      {showChatTab && (
        <TabPanel value={value} index={2}>
          <ChatEmbed livestream={video} />
        </TabPanel>
      )}
    </Box>
  );
};

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  open,
  onClose,
}) => {
  const router = useRouter();
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
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
            // InfoTabs fills vertical space left below VideoPlayer
            xs: "auto minmax(0, 1fr) / 1fr",
            // 1 row, 2 cols
            // VideoPlayer spans 2/3 dialog width, InfoTabs spans 1/3
            md: "minmax(0, 1fr) / 2fr 1fr",
          },
        }}
      >
        <VideoPlayer video={video} />
        <InfoTabs video={video} />
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
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ height: "100%", borderRadius: 0 }}
          onClick={onClose}
          color="inherit"
        >
          戻る
        </Button>
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
          {video.title}
        </Typography>
      </BottomNavigation>
    </Dialog>
  );
};
