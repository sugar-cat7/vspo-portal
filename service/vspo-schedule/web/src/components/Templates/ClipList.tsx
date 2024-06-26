import React, { useState } from "react";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Pagination,
  Avatar,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Clip } from "@/types/streaming";
import { getVideoIconUrl, isTrending } from "@/lib/utils";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Image from "next/image";
import { useVideoModalContext } from "@/hooks";
import { useTranslation } from "next-i18next";

type Props = {
  clips: Clip[];
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

const roundViewCount = (viewCount: number) => {
  return Math.trunc(viewCount / 100_000) * 100_000;
};

export const ClipList: React.FC<Props> = ({ clips }) => {
  const { pushVideo } = useVideoModalContext();
  const [page, setPage] = useState(1);
  const clipsPerPage = 24;
  const { t } = useTranslation("clips");

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedClips = clips.slice(
    (page - 1) * clipsPerPage,
    page * clipsPerPage,
  );

  return (
    <>
      <Grid container spacing={3}>
        {paginatedClips.map((clip) => {
          const iconUrl = getVideoIconUrl(clip);
          const isClipTrending = isTrending(clip);

          return (
            <Grid item xs={12} sm={6} md={4} key={clip.id}>
              <Box sx={{ position: "relative" }}>
                {isClipTrending && (
                  <Chip
                    label={t("clipLabels.trending")}
                    sx={{
                      position: "absolute",
                      transform: "translateY(-12px)",
                      zIndex: "3",
                      top: "0px",
                      right: "8px",
                      height: "24px",
                      backgroundColor: (theme) => theme.vars.palette.error.main,
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
                    ...(isClipTrending ? { border: "3px solid red" } : {}),
                  }}
                >
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
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                          >
                            {clip.channelTitle}
                          </Typography>
                          <StyledAvatar src={iconUrl} alt={clip.channelTitle} />
                        </Box>
                        {clip.viewCount && Number(clip.viewCount) > 100000 && (
                          <Chip
                            icon={
                              <PlayArrow
                                fontSize="small"
                                sx={{ color: "white !important" }}
                              />
                            }
                            label={t("viewCountLabel", {
                              views: roundViewCount(Number(clip.viewCount)),
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
    </>
  );
};
