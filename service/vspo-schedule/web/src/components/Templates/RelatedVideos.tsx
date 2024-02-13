import { memberNames } from "@/data/members";
import { TEMP_TIMESTAMP } from "@/lib/Const";
import { RelatedProps, fetchVspoRelatedVideo, fetcher } from "@/lib/api";
import { formatWithTimeZone } from "@/lib/utils";
import { Clip, Livestream } from "@/types/streaming";
import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Loading } from "../Elements";
import dynamic from "next/dynamic";
import { useModal } from "@/hooks";

const StyledCard = styled(Card)(({ theme }) => ({
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
}));

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

const StyledChannnelTitle = styled(Typography)({
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
  channnelId?: string,
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
    if (
      c.channelId === channnelId &&
      c.id !== videoId &&
      !clipIdSet.has(c.id)
    ) {
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

const LivestreamDetailsModal = dynamic(
  () => import("../Elements/Modal").then((mod) => mod.LivestreamDetailsModal),
  { ssr: false },
);

export const RelatedVideos: React.FC<{
  channnelId: string;
  videoId: string;
}> = ({ channnelId, videoId }) => {
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (index: number) => `/relatedVideo?page=${index + 1}&limit=5`,
    fetcher,
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
  const relatedLivestreams: Videos = useMemo(() => {
    // Extract data from each page and combine into one RelatedProps object
    const combinedData: RelatedProps = {
      liveStreams: [],
      clips: [],
    };

    data?.forEach((pageData) => {
      combinedData.liveStreams.push(...pageData.liveStreams);
      combinedData.clips.push(...pageData.clips);
    });

    return getRelatedVideos(combinedData, channnelId, videoId);
  }, [channnelId, data, videoId]);

  const loadMoreData = () => {
    setSize(size + 1); // fetch new data
  };

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <Box>
      <Box display="flex" sx={{ flexDirection: "column" }}>
        {relatedLivestreams.liveStreams.map((livestream) => (
          <StyledCard key={livestream.id}>
            <CardActionArea
              onClick={() => {
                setSelectedLivestream(livestream);
                openModal();
              }}
            >
              <Box display="flex">
                <Box sx={{ width: "120px" }}>
                  <StyledCardMedia
                    image={livestream.thumbnailUrl
                      .replace("%{width}", "320")
                      .replace("%{height}", "180")
                      .replace("-{width}x{height}", "-320x180")
                      .replace("http://", "https://")}
                    title={livestream.title}
                  />
                </Box>
                <StyledCardContent>
                  <StyledTitle variant="h5">{livestream.title}</StyledTitle>
                  <StyledChannnelTitle variant="body2" color="text.secondary">
                    {livestream.channelTitle}
                  </StyledChannnelTitle>
                  <Typography variant="body2" color="text.secondary">
                    {formatWithTimeZone(
                      new Date(
                        livestream?.scheduledStartTime ||
                          livestream?.createdAt ||
                          TEMP_TIMESTAMP,
                      ),
                      "ja",
                      "MM/dd (E)",
                    )}
                  </Typography>
                </StyledCardContent>
              </Box>
            </CardActionArea>
          </StyledCard>
        ))}
        {relatedLivestreams.clips.map((livestream) => (
          <StyledCard key={livestream.id}>
            <CardActionArea
              onClick={() => {
                setSelectedClip(livestream);
                openModal();
              }}
            >
              <Box display="flex">
                <Box sx={{ width: "120px" }}>
                  <StyledCardMedia
                    image={livestream.thumbnailUrl
                      .replace("%{width}", "320")
                      .replace("%{height}", "180")
                      .replace("-{width}x{height}", "-320x180")
                      .replace("http://", "https://")}
                    title={livestream.title}
                  />
                </Box>
                <StyledCardContent>
                  <StyledTitle variant="h5">{livestream.title}</StyledTitle>
                  <StyledChannnelTitle variant="body2" color="text.secondary">
                    {livestream.channelTitle}
                  </StyledChannnelTitle>
                  <Typography variant="body2" color="text.secondary">
                    {formatWithTimeZone(
                      new Date(
                        livestream?.scheduledStartTime ||
                          livestream?.createdAt ||
                          TEMP_TIMESTAMP,
                      ),
                      "ja",
                      "MM/dd (E)",
                    )}
                  </Typography>
                </StyledCardContent>
              </Box>
            </CardActionArea>
          </StyledCard>
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
        <LivestreamDetailsModal
          key={selectedLivestream.id}
          livestream={selectedLivestream}
          open={isOpen}
          onClose={closeModal}
        />
      )}
      {selectedClip && (
        <LivestreamDetailsModal
          key={selectedClip.id}
          clip={selectedClip}
          open={isOpen}
          onClose={closeModal}
        />
      )}
    </Box>
  );
};
