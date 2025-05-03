import { RelatedVideos } from "@/components/Templates";
import { useTimeZoneContext, useVideoModalContext } from "@/hooks";
import {
  formatDate,
  getLiveStatus,
  getVideoEmbedUrl,
  getVideoIconUrl,
  getVideoUrl,
  isLivestream,
  isOnPlatformWithChat,
} from "@/lib/utils";
import { Video } from "@/types/streaming";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import {
  Avatar,
  BottomNavigation,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Link, PlatformIcon } from "..";
import { ChatEmbed } from "../ChatEmbed";
import { HighlightedVideoChip } from "../Chip";
import { Clip } from "@/features/clips";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.vars.palette.customColors.vspoPurple,
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
  padding: theme.spacing(1),
  color: "white",

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: theme.vars.palette.customColors.darkGray,
  },
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

const VideoPlayerComponent: React.FC<{ video: Video | Clip }> = ({ video }) => {
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
  const { t } = useTranslation("common");
  const theme = useTheme();
  const { timeZone } = useTimeZoneContext();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const formattedStartTime = formatDate(
    video.scheduledStartTime || video.createdAt || "",
    "MM/dd HH:mm~",
    { timeZone },
  );
  const liveStatus = isLivestream(video) ? getLiveStatus(video) : undefined;
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
          <Tab label={t("videoModal.tabLabels.overview")} {...a11yProps(0)} />
          <Tab
            label={t("videoModal.tabLabels.relatedVideos")}
            {...a11yProps(1)}
          />
          {showChatTab && (
            <Tab label={t("videoModal.tabLabels.chat")} {...a11yProps(2)} />
          )}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Box>
          <TypographySmallOnMobile variant="h5">
            {video.title}
          </TypographySmallOnMobile>
          {liveStatus !== undefined && liveStatus !== "freechat" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                marginTop: "10px",
              }}
            >
              <TypographySmallOnMobile sx={{ marginRight: "10px" }}>
                {formattedStartTime}
              </TypographySmallOnMobile>
              {(liveStatus === "live" || liveStatus === "upcoming") && (
                <HighlightedVideoChip
                  highlightColor={
                    theme.vars.palette.customColors.videoHighlight[liveStatus]
                  }
                  bold
                >
                  {t(`liveStatus.${liveStatus}`)}
                </HighlightedVideoChip>
              )}
            </Box>
          )}
        </Box>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 2,
              mb: 2,
            }}
          >
            <Avatar src={iconUrl} />
            <TypographySmallOnMobile variant="h6" style={{ marginLeft: 8 }}>
              {video.channelTitle}
            </TypographySmallOnMobile>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 2,
              mb: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              {url && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PlatformIcon platform={video.platform} />}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: "none",
                  }}
                >
                  {t("videoModal.watch")}
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
                        title: video.title,
                        text: video.title,
                        url: url,
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
                {t("videoModal.share")}
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
              <MuiLink
                href={text}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
              >
                {text}
              </MuiLink>
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

export const VideoModal: React.FC = () => {
  const router = useRouter();
  const { activeVideo, popVideo, clearVideos } = useVideoModalContext();
  const { t } = useTranslation("common");
  //Clear video modal on url changes
  useEffect(() => {
    clearVideos();
  }, [router]);

  return (
    <Dialog open={activeVideo !== undefined} fullScreen>
      <StyledDialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* <NextLink href="/"> */}
          <Box
            onClick={() => {
              clearVideos();
            }}
            component={Link}
            href={`/schedule/all`}
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              color: "inherit",
              textDecoration: "none",
            }}
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
              {t("spodule")}
            </TypographySmallOnMobile>
          </Box>
          {/* </NextLink> */}
        </Box>
      </StyledDialogTitle>
      <Box
        sx={{
          position: "absolute",
          top: 3,
          right: 0,
        }}
      >
        <IconButton onClick={clearVideos}>
          <CloseIcon style={{ color: "white" }} />
        </IconButton>
      </Box>
      {activeVideo && (
        <StyledDialogContent
          key={activeVideo.id}
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
          <VideoPlayer video={activeVideo} />
          <InfoTabs video={activeVideo} />
        </StyledDialogContent>
      )}
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
          onClick={popVideo}
          color="inherit"
        >
          {t("back")}
        </Button>
        <Typography
          variant="body1"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "80%", // 適宜調整してください
            textAlign: "left",
            paddingLeft: "8px",
            paddingRight: "8px",
          }}
        >
          {activeVideo && activeVideo.title}
        </Typography>
      </BottomNavigation>
    </Dialog>
  );
};
