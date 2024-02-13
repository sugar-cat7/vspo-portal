import React, { useContext, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Pagination,
  Avatar,
  Chip,
  PaletteColor,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Clip, Platform } from "@/types/streaming";
import { getLivestreamUrl, isTrending } from "@/lib/utils";
import { members } from "@/data/members";
import { PlayArrow } from "@mui/icons-material";
import { EmbedModeContext } from "@/context/EmbedMode";
import { useModal } from "@/hooks";
import dynamic from "next/dynamic";
import Image from "next/image";

const LivestreamDetailsModal = dynamic(
  () => import("../Elements/Modal").then((mod) => mod.LivestreamDetailsModal),
  { ssr: false },
);

type Props = {
  clips: Clip[];
};

const StyledCardMedia = styled(Box)({
  paddingTop: "56.25%", // 16:9 aspect ratio
  objectFit: "contain",
});

const ResponsiveIframeWrapper = styled("div")({
  position: "relative",
  overflow: "hidden",
  paddingTop: "56.25%", // for 16:9 aspect ratio
});

const ResponsiveIframe = styled("iframe")({
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  border: "0",
});
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  [theme.breakpoints.down("sm")]: {
    width: 32,
    height: 32,
  },
}));
const getViewCountChipStyle = (viewCount: number) => {
  if (viewCount >= 10000) {
    return {
      backgroundColor: "rgba(0, 0, 255, 0.7)",
      color: "white",
      fontWeight: "bold",
    };
  } else if (viewCount >= 5000) {
    return {
      backgroundColor: "rgba(0, 128, 0, 0.7)",
      color: "white",
    };
  } else {
    return {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      color: "white",
    };
  }
};

const formatViewCount = (viewCount: number) => {
  return Math.floor(viewCount / 100_000) * 10;
};

const getClipLabel = (clip: Clip) => {
  if (isTrending(clip)) {
    return { label: "急上昇", color: "error" };
  }
  // if (isPopular(clip)) {
  //   return { label: "人気", color: "warning" };
  // }
  // if (isNew(clip)) {
  //   return { label: "新着", color: "success" };
  // }
  return null;
};

const VideoPlayerOrLinkComponent: React.FC<{
  url: string;
  clip: Clip;
  isEmbedMode: boolean;
}> = ({ url, clip, isEmbedMode }) => {
  // Check if the video is from YouTube or Twitch and adjust the embed URL accordingly
  let embedUrl;
  if (clip.platform === Platform.YouTube) {
    embedUrl = url.replace("watch?v=", "embed/");
  } else if (clip.platform === Platform.Twitch) {
    embedUrl = `https://clips.twitch.tv/embed?clip=${clip.id}&parent=${document.location.hostname}&autoplay=false`;
  }

  if (isEmbedMode) {
    return (
      <ResponsiveIframeWrapper>
        <ResponsiveIframe
          key={embedUrl}
          src={embedUrl}
          title={`${clip.platform} video player`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </ResponsiveIframeWrapper>
    );
  } else {
    return (
      <CardMedia
        component="img"
        image={clip.thumbnailUrl}
        alt={clip.title}
        sx={{
          height: 0,
          paddingTop: "56.25%", // 16:9 アスペクト比
          backgroundSize: "cover",
          backgroundImage: `url(${clip.thumbnailUrl})`,
        }}
      />
    );
  }
};

const VideoPlayerOrLink = React.memo(VideoPlayerOrLinkComponent);

export const ClipList: React.FC<Props> = ({ clips }) => {
  const [page, setPage] = useState(1);
  const [isEmbedMode] = useContext(EmbedModeContext);
  const { isOpen, openModal: baseOpenModal, closeModal } = useModal();
  const [clickedClip, setClickedClip] = useState<Clip | null>(null);
  const clipsPerPage = 24;

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const openModal = (clip: Clip) => {
    setClickedClip(clip);
    baseOpenModal();
  };

  const paginatedClips = clips.slice(
    (page - 1) * clipsPerPage,
    page * clipsPerPage,
  );

  return (
    <Container maxWidth="lg" sx={{ paddingTop: "50px" }}>
      <Grid container spacing={3}>
        {paginatedClips.map((clip) => {
          const url = getLivestreamUrl({
            videoId: clip.id,
            platform: clip.platform,
            isClip: true,
            externalLink: clip?.link,
          });
          const iconUrl =
            clip.platform === Platform.Twitch
              ? members
                  .filter((m) => m.twitchChannelId === clip.channelId)
                  .at(0)?.iconUrl
              : clip?.iconUrl;

          const clipLabel = getClipLabel(clip);
          return (
            <Grid item xs={12} sm={6} md={4} key={clip.id}>
              <Box
                height="100%"
                display="flex"
                sx={{
                  position: "relative",
                  ...(clipLabel ? { border: "3px solid red" } : {}),
                }}
              >
                {clipLabel && (
                  <Chip
                    label={clipLabel.label}
                    sx={{
                      position: "absolute",
                      transform: "translateY(-12px)",
                      zIndex: "3",
                      top: "0px",
                      right: "8px",
                      height: "24px",
                      backgroundColor: (theme) =>
                        (
                          theme.vars.palette[
                            clipLabel.color as keyof typeof theme.vars.palette
                          ] as PaletteColor
                        ).main,
                      color: "white",
                    }}
                  />
                )}
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <CardActionArea onClick={() => openModal(clip)}>
                    <StyledCardMedia position="relative">
                      <Image
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </StyledCardMedia>
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="body1"
                        component="div"
                        sx={{
                          maxHeight: "3em",
                          minHeight: "3em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {clip.title}
                      </Typography>
                      <Box
                        mt="auto"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          mt="auto"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                          >
                            {clip.channelTitle}
                          </Typography>
                          <StyledAvatar>
                            {iconUrl && (
                              <Image
                                src={iconUrl}
                                alt={clip.channelTitle}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            )}
                          </StyledAvatar>
                        </Box>
                        {clip?.viewCount && Number(clip.viewCount) > 100000 && (
                          <Chip
                            icon={
                              <PlayArrow
                                fontSize="small"
                                sx={{ color: "white !important" }}
                              />
                            }
                            label={`${formatViewCount(
                              Number(clip.viewCount),
                            )}万以上`}
                            sx={{
                              height: "24px",
                              width: "90px",
                              backgroundColor: "rgba(0, 0, 0, 0.6)",
                              color: "white",
                              fontSize: "10px",
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Grid>
          );
        })}
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <Pagination
          count={Math.ceil(clips.length / clipsPerPage)}
          page={page}
          onChange={handleChange}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
        />
      </Box>
      {clickedClip && (
        <LivestreamDetailsModal
          key={clickedClip.id}
          clip={clickedClip}
          open={isOpen}
          onClose={() => {
            setClickedClip(null);
            closeModal();
          }}
          isDefaultEmbedMode={isEmbedMode}
        />
      )}
    </Container>
  );
};
