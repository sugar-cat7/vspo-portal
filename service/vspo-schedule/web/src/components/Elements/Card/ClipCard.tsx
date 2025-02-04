import { useTranslation } from "next-i18next";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { Avatar, Box, CardContent, Chip, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { getVideoIconUrl, isTrending } from "@/lib/utils";
import { Clip } from "@/types/streaming";
import { VideoCard } from "./VideoCard";

type Props = {
  clip: Clip;
};

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  [theme.breakpoints.down("sm")]: {
    width: 32,
    height: 32,
  },
}));

const ViewCountLabel: React.FC<{
  viewCount: number;
}> = ({ viewCount }) => {
  const { t } = useTranslation("clips");
  return (
    <Chip
      icon={<PlayArrow fontSize="small" sx={{ color: "white !important" }} />}
      label={t("viewCountLabel", {
        views: roundViewCount(viewCount),
        notation: "compact",
        compactDisplay: "short",
      })}
      sx={{
        height: "24px",
        width: "90px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        fontSize: "10px",
      }}
    />
  );
};

const roundViewCount = (viewCount: number) => {
  return Math.trunc(viewCount / 100_000) * 100_000;
};

export const ClipCard: React.FC<Props> = ({ clip }) => {
  const { t } = useTranslation("clips");
  const theme = useTheme();

  const iconUrl = getVideoIconUrl(clip);
  const cardHighlight = isTrending(clip)
    ? {
        label: t("clipLabels.trending"),
        color: theme.vars.palette.customColors.videoHighlight.trending,
        bold: false,
      }
    : undefined;

  return (
    <VideoCard video={clip} highlight={cardHighlight}>
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
          sx={{
            mt: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              mt: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Typography
              variant="body2"
              component="p"
              sx={{ color: "text.secondary" }}
            >
              {clip.channelTitle}
            </Typography>
            <StyledAvatar src={iconUrl} alt={clip.channelTitle} />
          </Box>
          {clip.viewCount && Number(clip.viewCount) > 100000 && (
            <ViewCountLabel viewCount={Number(clip.viewCount)} />
          )}
        </Box>
      </CardContent>
    </VideoCard>
  );
};
