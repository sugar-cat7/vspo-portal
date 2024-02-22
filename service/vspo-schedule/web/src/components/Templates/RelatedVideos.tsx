import { memberNames } from "@/data/members";
import { TEMP_TIMESTAMP } from "@/lib/Const";
import { RelatedProps, fetcher } from "@/lib/api";
import { formatWithTimeZone } from "@/lib/utils";
import { Clip, Livestream } from "@/types/streaming";
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
import React, { useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Loading } from "../Elements";
import dynamic from "next/dynamic";
import { useModal } from "@/hooks";

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
  "-webkit-line-clamp": "2",
  "-webkit-box-orient": "vertical",
  overflow: "hidden",
});

const StyledChannelTitle = styled(Typography)({
  display: "-webkit-box",
  "-webkit-line-clamp": "1",
  "-webkit-box-orient": "vertical",
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
      memberNames.find((m) => c.title.includes(m.replace(" ", ""))) &&
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

const VideoModal = dynamic(
  () => import("../Elements/Modal").then((mod) => mod.VideoModal),
  { ssr: false },
);

type RelatedVideoCardProps<T extends Livestream | Clip> = {
  video: T;
  setSelectedVideo: React.Dispatch<React.SetStateAction<T | null>>;
  openModal: () => void;
};

const RelatedVideoCard = <T extends Livestream | Clip>({
  video,
  setSelectedVideo,
  openModal,
}: RelatedVideoCardProps<T>) => {
  return (
    <StyledCard>
      <CardActionArea
        onClick={() => {
          setSelectedVideo(video);
          openModal();
        }}
      >
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
              {formatWithTimeZone(
                new Date(
                  video.scheduledStartTime || video.createdAt || TEMP_TIMESTAMP,
                ),
                "ja",
                "MM/dd (E)",
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
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedLivestream, setSelectedLivestream] =
    useState<Livestream | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
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
        {relatedVideos.liveStreams.map((livestream) => (
          <RelatedVideoCard
            key={livestream.id}
            video={livestream}
            setSelectedVideo={setSelectedLivestream}
            openModal={openModal}
          />
        ))}
        {relatedVideos.clips.map((clip) => (
          <RelatedVideoCard
            key={clip.id}
            video={clip}
            setSelectedVideo={setSelectedClip}
            openModal={openModal}
          />
        ))}
      </Box>
      {isValidating && <Loading />}
      <Button
        onClick={loadMoreData}
        disabled={isValidating}
        sx={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        もっと見る
      </Button>
      {selectedLivestream && (
        <VideoModal
          key={selectedLivestream.id}
          video={selectedLivestream}
          open={isOpen}
          onClose={closeModal}
        />
      )}
      {selectedClip && (
        <VideoModal
          key={selectedClip.id}
          video={selectedClip}
          open={isOpen}
          onClose={closeModal}
        />
      )}
    </Box>
  );
};
