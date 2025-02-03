import { members } from "@/data/members";
import { DEFAULT_LOCALE, TEMP_TIMESTAMP } from "@/lib/Const";
import { RelatedProps, fetcher } from "@/lib/api";
import { formatDate, isRelevantMember } from "@/lib/utils";
import { Clip, Livestream, Video } from "@/types/streaming";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { Loading } from "../Elements";
import { useTimeZoneContext, useVideoModalContext } from "@/hooks";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const StyledCard = styled(Card)({
  marginTop: "8px",
  marginBottom: "8px",
  "& .MuiTypography-root": {
    fontSize: "0.75rem",
  },
  "& .MuiTypography-h5": {
    fontSize: "0.9rem",
  },

  display: "flex",
  height: "90px",
  width: "100%",
});

const StyledCardMedia = styled(CardMedia)({
  width: "120px", // fixed width
  height: "90px", // fixed height
  objectFit: "cover",
  backgroundSize: "cover",
});

const StyledCardContent = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  alignContent: "center",
  margin: "0",
  padding: "0",
  marginLeft: "8px",
  paddingTop: "8px",
  justifyContent: "center",
  // flex: 1, // flex grow to fill remaining space
});

const StyledTitle = styled(Typography)({
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

const StyledChannelTitle = styled(Typography)({
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

type Videos = {
  liveStreams: Livestream[];
  clips: Clip[];
};

const getRelatedVideos = (
  relatedVideos?: RelatedProps,
  channelId?: string,
  videoId?: string,
): Videos => {
  if (!relatedVideos) return { liveStreams: [], clips: [] };

  const livestreamIdSet = new Set();
  const clipIdSet = new Set();

  const relatedLivestreams: Livestream[] = relatedVideos.liveStreams.filter(
    (l) => {
      if (l.id !== videoId && !livestreamIdSet.has(l.id)) {
        livestreamIdSet.add(l.id);
        return true;
      }
      return false;
    },
  );

  const relatedClips: Clip[] = relatedVideos.clips.filter((c) => {
    if (c.channelId === channelId && c.id !== videoId && !clipIdSet.has(c.id)) {
      clipIdSet.add(c.id);
      return true;
    }
    return false;
  });

  const relatedMemberClip = relatedVideos.clips.filter((c) => {
    if (
      members.some((member) => isRelevantMember(member, c.title)) &&
      !clipIdSet.has(c.id)
    ) {
      clipIdSet.add(c.id);
      return true;
    }
    return false;
  });

  const relatedVideosArray: Videos = {
    liveStreams: relatedLivestreams,
    clips: [...relatedClips, ...relatedMemberClip],
  };

  return relatedVideosArray;
};

type RelatedVideoCardProps = {
  video: Video;
  onClick: () => void;
};

const RelatedVideoCard: React.FC<RelatedVideoCardProps> = ({
  video,
  onClick,
}) => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LOCALE;
  const { timeZone } = useTimeZoneContext();

  return (
    <StyledCard>
      <CardActionArea onClick={onClick}>
        <Box display="flex">
          <Box sx={{ width: "120px" }}>
            <StyledCardMedia
              image={video.thumbnailUrl
                .replace("%{width}", "320")
                .replace("%{height}", "180")
                .replace("-{width}x{height}", "-320x180")
                .replace("http://", "https://")}
              title={video.title}
            />
          </Box>
          <StyledCardContent>
            <StyledTitle variant="h5">{video.title}</StyledTitle>
            <StyledChannelTitle variant="body2" color="text.secondary">
              {video.channelTitle}
            </StyledChannelTitle>
            <Typography variant="body2" color="text.secondary">
              {formatDate(
                video.scheduledStartTime || video.createdAt || TEMP_TIMESTAMP,
                "MM/dd (E)",
                { localeCode: locale, timeZone },
              )}
            </Typography>
          </StyledCardContent>
        </Box>
      </CardActionArea>
    </StyledCard>
  );
};

export const RelatedVideos: React.FC<{
  channelId: string;
  videoId: string;
}> = ({ channelId, videoId }) => {
  const { pushVideo } = useVideoModalContext();
  const { t } = useTranslation("common");
  const { data, error, size, setSize, isValidating } = useSWRInfinite<
    Videos,
    Error
  >(
    (index: number) => `/relatedVideo?page=${index + 1}&limit=5`,
    fetcher<Videos>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );
  const relatedVideos: Videos = useMemo(() => {
    // Extract data from each page and combine into one RelatedProps object
    const combinedData: RelatedProps = {
      liveStreams: [],
      clips: [],
    };

    data?.forEach((pageData) => {
      combinedData.liveStreams.push(...pageData.liveStreams);
      combinedData.clips.push(...pageData.clips);
    });

    return getRelatedVideos(combinedData, channelId, videoId);
  }, [channelId, data, videoId]);

  const loadMoreData = () => {
    setSize(size + 1); // fetch new data
  };

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <Box>
      <Box display="flex" sx={{ flexDirection: "column" }}>
        {[...relatedVideos.liveStreams, ...relatedVideos.clips].map((video) => (
          <RelatedVideoCard
            key={video.id}
            video={video}
            onClick={() => pushVideo(video)}
          />
        ))}
      </Box>
      {isValidating && <Loading />}
      <Button
        onClick={loadMoreData}
        disabled={isValidating}
        sx={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        {t("relatedVideos.loadMore")}
      </Button>
    </Box>
  );
};
