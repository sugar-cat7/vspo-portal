import React, { useEffect } from "react";
import { GetStaticProps } from "next";
import { Clip } from "@/types/streaming";
import { filterByTimeframe, formatWithTimeZone } from "@/lib/utils";
import { mockTwitchClips } from "@/data/clips";
import { Box } from "@mui/system";
import { NextPageWithLayout } from "./_app";
import { Loading, SearchDialog } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { ClipTabs } from "@/components/Templates";
import { members } from "@/data/members";
import { CustomBottomNavigation } from "@/components/Layout/Navigation";
import { fetchTwitchClips } from "@/lib/api";
import { ENVIRONMENT } from "@/lib/Const";

type ClipsProps = {
  clips: Clip[];
  lastUpdateDate: string;
};

const TwitchClipPage: NextPageWithLayout<ClipsProps> = ({ clips }) => {
  const [filteredClips, setFilteredClips] = React.useState<Clip[]>(clips);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(true);
  useEffect(() => {
    setIsProcessing(false);
  }, [filteredClips]);
  useEffect(() => {
    setIsProcessing(true);

    const oneWeekClips =
      clips.at(0)?.platform === "twitch"
        ? filterByTimeframe(clips, "1month")
        : filterByTimeframe(clips, "1week");
    setFilteredClips(oneWeekClips);
    setIsProcessing(false);
  }, [clips]);

  if (!clips) {
    return <></>;
  }

  return (
    <>
      {isProcessing ? (
        <Loading />
      ) : filteredClips.length === 0 ? (
        <Box mt={4} sx={{ padding: "50px" }}>
          対象のクリップはありません。
        </Box>
      ) : (
        <ClipTabs clips={filteredClips} />
      )}
      <SearchDialog
        clips={clips}
        setFilteredClips={setFilteredClips}
        searchTarget="clip"
        setIsProcessing={setIsProcessing}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps<ClipsProps> = async () => {
  let pastClips: Clip[] = [];

  if (ENVIRONMENT === "production") {
    const memberClipsPromises = members.map((member) =>
      member.twitchChannelId
        ? fetchTwitchClips(member.twitchChannelId)
        : Promise.resolve([]),
    );

    const settledResults = await Promise.allSettled(memberClipsPromises);

    settledResults.forEach((result) => {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        pastClips = [...result.value, ...pastClips];
      }
    });
  } else {
    pastClips = mockTwitchClips as Clip[];
  }

  return {
    props: {
      clips: pastClips,
      lastUpdateDate: formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd HH:mm"),
    },
    revalidate: 1800,
  };
};

TwitchClipPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title="ぶいすぽっ!クリップ一覧"
      description="ぶいすぽっ!メンバーのTwitchクリップをまとめています。"
      lastUpdateDate={pageProps.lastUpdateDate}
      path="/twitch-clips"
    >
      {page}
      <CustomBottomNavigation />
    </ContentLayout>
  );
};

export default TwitchClipPage;
