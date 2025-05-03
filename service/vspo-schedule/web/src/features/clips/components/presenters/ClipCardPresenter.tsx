import { Clip } from "../../domain/clip";
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { VideoCard } from "@/components/Elements/Card/VideoCard";
export type ClipCardPresenterProps = {
  clip: Clip;
};

export const ClipCardPresenter: React.FC<ClipCardPresenterProps> = ({
  clip,
}) => {
  return (
    <VideoCard video={clip}>
      <Card sx={{ maxWidth: 345, height: "100%" }}>
        <CardContent sx={{ height: 130 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {clip.title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" noWrap>
              {clip.channelTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {clip.viewCount !== undefined ? clip.viewCount : 0} 回
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </VideoCard>
  );
};
