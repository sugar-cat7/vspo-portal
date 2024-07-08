import Image from "next/image";
import { useTranslation } from "next-i18next";
import PlayArrow from "@mui/icons-material/PlayArrow";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useVideoModalContext } from "@/hooks";
import { getVideoIconUrl, isTrending } from "@/lib/utils";
import { Clip } from "@/types/streaming";

type Props = {
  clip: Clip;
};

const StyledCardMedia = styled(Box)({
  paddingTop: "56.25%", // 16:9 aspect ratio
  objectFit: "contain",
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  [theme.breakpoints.down("sm")]: {
    width: 32,
    height: 32,
  },
}));

const TrendingLabel = styled(Chip)(({ theme }) => ({
  position: "absolute",
  transform: "translateY(-12px)",
  zIndex: "3",
  top: "0px",
  right: "8px",
  height: "24px",
  backgroundColor: theme.vars.palette.error.main,
  color: "white",
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

type StyledCardProps = {
  isClipTrending: boolean;
};

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "isClipTrending",
})<StyledCardProps>(({ isClipTrending }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  position: "relative",
  ...(isClipTrending ? { border: "3px solid red" } : {}),
}));

const roundViewCount = (viewCount: number) => {
  return Math.trunc(viewCount / 100_000) * 100_000;
};

export const ClipCard: React.FC<Props> = ({ clip }) => {
  const { pushVideo } = useVideoModalContext();
  const { t } = useTranslation("clips");

  const iconUrl = getVideoIconUrl(clip);
  const isClipTrending = isTrending(clip);

  return (
    <Box sx={{ position: "relative" }}>
      {isClipTrending && <TrendingLabel label={t("clipLabels.trending")} />}
      <StyledCard isClipTrending={isClipTrending}>
        <CardActionArea onClick={() => pushVideo(clip)}>
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
                <Typography variant="body2" color="textSecondary" component="p">
                  {clip.channelTitle}
                </Typography>
                <StyledAvatar src={iconUrl} alt={clip.channelTitle} />
              </Box>
              {clip.viewCount && Number(clip.viewCount) > 100000 && (
                <ViewCountLabel viewCount={Number(clip.viewCount)} />
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </StyledCard>
    </Box>
  );
};
