import React, { useEffect } from "react";
import { GetStaticProps } from "next";
import { Clip } from "@/types/streaming";
import { filterByTimeframe, formatWithTimeZone } from "@/lib/utils";
import { Box } from "@mui/system";
import { NextPageWithLayout } from "./_app";
import { Loading, SearchDialog } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { ClipTabs } from "@/components/Templates";
import { CustomBottomNavigation } from "@/components/Layout/Navigation";
import { fetchVspoClips } from "@/lib/api";

type ClipsProps = {
  clips: Clip[];
  lastUpdateDate: string;
};

const ClipPage: NextPageWithLayout<ClipsProps> = ({ clips }) => {
  const [filteredClips, setFilteredClips] = React.useState<Clip[]>(clips);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(true);
  useEffect(() => {
    setIsProcessing(false);
  }, [filteredClips]);
  useEffect(() => {
    setIsProcessing(true);
    const oneWeekClips = filterByTimeframe(clips, "1week");
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
          対象の切り抜きはありません。
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
  const pastClips = await fetchVspoClips();

  return {
    props: {
      clips: pastClips,
      lastUpdateDate: formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd HH:mm"),
    },
    revalidate: 1800,
  };
};

ClipPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title="ぶいすぽっ!切り抜き一覧"
      description="ぶいすぽっ!メンバーの切り抜き動画をまとめています。"
      lastUpdateDate={pageProps.lastUpdateDate}
    >
      {page}
      <CustomBottomNavigation />
    </ContentLayout>
  );
};

export default ClipPage;
