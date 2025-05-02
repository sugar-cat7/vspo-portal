import { Loading, SearchDialog } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { ClipTabs } from "@/components/Templates";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { fetchTwitchClips } from "@/lib/api";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { filterByTimeframe, getInitializedI18nInstance } from "@/lib/utils";
import { Clip } from "@/types/streaming";
import { Box } from "@mui/system";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect } from "react";
import { NextPageWithLayout } from "./_app";

type ClipsProps = {
  clips: Clip[];
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
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

  const { t } = useTranslation("clips");

  if (!clips) {
    return <></>;
  }

  return (
    <>
      {isProcessing ? (
        <Loading />
      ) : filteredClips.length === 0 ? (
        <Box
          sx={{
            mt: 2,
            padding: "0 50px 50px",
          }}
        >
          {t("noClips")}
        </Box>
      ) : (
        <ClipTabs clips={filteredClips} />
      )}
      <SearchDialog
        clips={clips}
        setFilteredClips={setFilteredClips}
        setIsProcessing={setIsProcessing}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps<ClipsProps> = async ({
  locale = DEFAULT_LOCALE,
}) => {
  const clips = await fetchTwitchClips({ lang: locale });

  const translations = await serverSideTranslations(locale, [
    "common",
    "clips",
  ]);
  const { t } = getInitializedI18nInstance(translations, "clips");

  return {
    props: {
      ...translations,
      clips,
      lastUpdateTimestamp: getCurrentUTCDate().getTime(),
      meta: {
        title: t("twitchClips.title"),
        description: t("twitchClips.description"),
      },
    },
  };
};

TwitchClipPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
      path="/twitch-clips"
    >
      {page}
    </ContentLayout>
  );
};

export default TwitchClipPage;
