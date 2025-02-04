import Image from "next/image";
import { Box, Card, CardActionArea } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useVideoModalContext } from "@/hooks";
import { Video } from "@/types/streaming";
import { HighlightedVideoChip } from "../Chip";

type Props = {
  video: Video;
  children: React.ReactNode; // CardContent
  highlight?: {
    label: string;
    color: string;
    bold: boolean;
  };
};

const StyledHighlightedVideoChip = styled(HighlightedVideoChip)(
  ({ theme }) => ({
    position: "absolute",
    top: "-12px",
    right: "6px",
    zIndex: "3",
    transformOrigin: "center right",
    [theme.breakpoints.down("md")]: {
      transform: "scale(0.875)",
      right: "5px",
    },
    [theme.breakpoints.down("sm")]: {
      transform: "scale(0.75)",
      right: "4px",
    },
  }),
);

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "highlightColor",
})<{ highlightColor?: string }>(({ theme, highlightColor }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  border: highlightColor ? `3px solid ${highlightColor}` : "none",
  backgroundColor: "white",
  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: theme.vars.palette.customColors.gray,
  },
}));

const StyledCardMedia = styled(Box)({
  paddingTop: "56.25%", // 16:9 aspect ratio
  objectFit: "contain",
});

export const VideoCard: React.FC<Props> = ({ video, highlight, children }) => {
  const { pushVideo } = useVideoModalContext();

  return (
    <Box sx={{ position: "relative" }}>
      {highlight && (
        <StyledHighlightedVideoChip
          highlightColor={highlight.color}
          bold={highlight.bold}
        >
          {highlight.label}
        </StyledHighlightedVideoChip>
      )}
      <StyledCard highlightColor={highlight?.color}>
        <CardActionArea onClick={() => pushVideo(video)}>
          <StyledCardMedia sx={{ position: "relative" }}>
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </StyledCardMedia>
          {children}
        </CardActionArea>
      </StyledCard>
    </Box>
  );
};
