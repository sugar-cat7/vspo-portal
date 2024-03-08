import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
import { LiveStatus, Livestream } from "@/types/streaming";
import { getLiveStatus, formatWithTimeZone } from "@/lib/utils";
import { PlatformIcon } from "../Icon";
import { useModal } from "@/hooks";
import dynamic from "next/dynamic";
import Image from "next/image";

type StyledCardProps = {
  liveStatus: LiveStatus | "freechat";
};

const LiveLabel = styled("div")<{ isUpcoming?: boolean }>(
  ({ theme, isUpcoming }) => ({
    width: "78px",
    color: "rgb(255, 255, 255)",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "Roboto, sans-serif",
    textAlign: "center",
    lineHeight: "24px",
    background: isUpcoming ? "rgb(45, 75, 112)" : "rgb(255, 0, 0)",
    borderRadius: "12px",
    position: "absolute",
    top: "-12px",
    right: "6px",
    zIndex: "3",
    [theme.breakpoints.down("md")]: {
      // CSS for tablet devices
      width: "60px",
      fontSize: "12px",
      lineHeight: "18px",
      top: "-10px",
      right: "4px",
    },
    [theme.breakpoints.down("sm")]: {
      // CSS for mobile devices
      width: "50px",
      fontSize: "10px",
      lineHeight: "14px",
      top: "-8px",
      right: "2px",
    },
  }),
);

const ResponsiveTypography = styled(Typography)(({ theme }) => ({
  paddingRight: "1em",
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    paddingRight: "0.8em",
  },
}));

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "liveStatus",
})<StyledCardProps>(({ theme, liveStatus }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  border:
    liveStatus === "live"
      ? "3px solid red"
      : liveStatus === "upcoming"
        ? "3px solid rgb(45, 75, 112)"
        : "none",
  backgroundColor: "white",
  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#353535",
  },
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    transform: "unset",
  },
}));
const CardBox = styled(Box)({
  position: "relative",
});
const StyledCardMedia = styled(Box)({
  paddingTop: "56.25%", // 16:9 aspect ratio
  objectFit: "contain",
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flex: "1 0 auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    padding: "12px",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  [theme.breakpoints.down("sm")]: {
    width: 36,
    height: 36,
  },
}));

const HiddenOnSm = styled("div")(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));
const FontSizeOnTypography = styled(Typography)(
  ({ theme }) => ({
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
    },
  }),
  ({ title }) => ({
    marginLeft: title?.startsWith("【") ? "-10px" : 0,
  }),
);

const VideoModal = dynamic(
  () => import("../Modal").then((mod) => mod.VideoModal),
  { ssr: false },
);

type LivestreamCardProps = {
  livestream: Livestream;
};

export const LivestreamCard: React.FC<LivestreamCardProps> = ({
  livestream,
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  const { title, channelTitle, scheduledStartTime, iconUrl, platform } =
    livestream;
  const livestreamStatus = useMemo(
    () => getLiveStatus(livestream),
    [livestream],
  );
  return (
    <CardBox>
      {livestreamStatus === "live" && <LiveLabel>Live</LiveLabel>}
      {livestreamStatus === "upcoming" && (
        <LiveLabel isUpcoming>配信予定</LiveLabel>
      )}
      <StyledCard liveStatus={livestreamStatus}>
        <CardActionArea onClick={openModal}>
          <StyledCardMedia position="relative">
            <Image
              src={livestream.thumbnailUrl}
              alt={livestream.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </StyledCardMedia>
          <StyledCardContent>
            <div>
              <FontSizeOnTypography variant="h5" noWrap title={title}>
                {title}
              </FontSizeOnTypography>
              <HiddenOnSm>
                <Typography variant="subtitle1" color="text.secondary" noWrap>
                  {channelTitle}
                </Typography>
              </HiddenOnSm>
            </div>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {livestreamStatus !== "freechat" && (
                <ResponsiveTypography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ paddingTop: "7px" }}
                >
                  <Typography
                    component="span"
                    sx={{
                      paddingTop: "3px",
                      paddingRight: "3px",
                    }}
                  >
                    {formatWithTimeZone(scheduledStartTime, "ja", "HH:mm")}~
                  </Typography>
                  <PlatformIcon platform={platform} />
                </ResponsiveTypography>
              )}
              <StyledAvatar src={iconUrl} alt={channelTitle} />
            </Box>
          </StyledCardContent>
        </CardActionArea>
        <VideoModal
          key={livestream.id}
          video={livestream}
          open={isOpen}
          onClose={closeModal}
        />
      </StyledCard>
    </CardBox>
  );
};
