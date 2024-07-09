import React, { useMemo } from "react";
import { CardContent, Typography, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
import { LiveStatus, Livestream } from "@/types/streaming";
import { getLiveStatus, formatDate } from "@/lib/utils";
import { PlatformIcon } from "../Icon";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { VideoCard } from "./VideoCard";

const highlightColors = {
  live: "red",
  upcoming: "rgb(45, 75, 112)",
} satisfies Partial<Record<LiveStatus, string>>;

const ResponsiveTypography = styled(Typography)(({ theme }) => ({
  paddingRight: "1em",
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    paddingRight: "0.8em",
  },
}));

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

type LivestreamCardProps = {
  livestream: Livestream;
};

export const LivestreamCard: React.FC<LivestreamCardProps> = ({
  livestream,
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { title, channelTitle, scheduledStartTime, iconUrl, platform } =
    livestream;
  const livestreamStatus = useMemo(
    () => getLiveStatus(livestream),
    [livestream],
  );
  const cardHighlight =
    livestreamStatus === "live" || livestreamStatus === "upcoming"
      ? {
          label: t(`liveStatus.${livestreamStatus}`),
          color: highlightColors[livestreamStatus],
          bold: true,
        }
      : undefined;

  return (
    <VideoCard video={livestream} highlight={cardHighlight}>
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
                {formatDate(scheduledStartTime, "HH:mm", {
                  localeCode: locale,
                })}
                ~
              </Typography>
              <PlatformIcon platform={platform} />
            </ResponsiveTypography>
          )}
          <StyledAvatar src={iconUrl} alt={channelTitle} />
        </Box>
      </StyledCardContent>
    </VideoCard>
  );
};
