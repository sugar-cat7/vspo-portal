import React, { useEffect } from "react";
import { GetStaticProps } from "next";
import { Clip } from "@/types/streaming";
import {
  filterByTimeframe,
  formatDate,
  getInitializedI18nInstance,
} from "@/lib/utils";
import { Box } from "@mui/system";
import { NextPageWithLayout } from "./_app";
import { Loading, SearchDialog } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { ClipTabs } from "@/components/Templates";
import { fetchClips } from "@/lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { useTranslation } from "next-i18next";
import { getCurrentUTCDate } from "@/lib/dayjs";

type ClipsProps = {
  clips: Clip[];
  lastUpdateDate: string;
  meta: {
    title: string;
    description: string;
  };
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

  const { t } = useTranslation("clips");

  if (!clips) {
    return <></>;
  }

  return (
    <>
      {isProcessing ? (
        <Loading />
      ) : filteredClips.length === 0 ? (
        <Box mt={2} sx={{ padding: "0 50px 50px" }}>
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
  const pastClips = await fetchClips({ lang: locale });

  const translations = await serverSideTranslations(locale, [
    "common",
    "clips",
  ]);
  const { t } = getInitializedI18nInstance(translations, "clips");

  return {
    props: {
      ...translations,
      clips: pastClips,
      lastUpdateDate: formatDate(getCurrentUTCDate(), "yyyy/MM/dd HH:mm", {
        localeCode: locale,
      }),
      meta: {
        title: t("youtubeClips.title"),
        description: t("youtubeClips.description"),
      },
    },
    revalidate: 1800,
  };
};

ClipPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      lastUpdateDate={pageProps.lastUpdateDate}
      path="/clips"
    >
      {page}
    </ContentLayout>
  );
};

export default ClipPage;
