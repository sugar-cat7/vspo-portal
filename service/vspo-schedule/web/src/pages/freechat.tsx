import { LivestreamCard } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { getInitializedI18nInstance } from "@/lib/utils";
import { GetStaticProps } from "next";
import React from "react";
import { NextPageWithLayout } from "./_app";
import { Livestream } from "@/types/streaming";
import Grid from "@mui/material/Grid2";
import { members } from "@/data/members";
import { fetchFreechats } from "@/lib/api";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getCurrentUTCDate } from "@/lib/dayjs";

type FreechatsProps = {
  freechats: Livestream[];
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
};

const FreechatPage: NextPageWithLayout<FreechatsProps> = ({ freechats }) => {
  return (
    <Grid container spacing={3} sx={{ width: "100%" }}>
      {freechats.map((freechat) => (
        <Grid size={{ xs: 6, md: 3 }} key={freechat.id}>
          <LivestreamCard livestream={freechat} isFreechat={true} />
        </Grid>
      ))}
    </Grid>
  );
};

export const getStaticProps: GetStaticProps<FreechatsProps> = async ({
  locale = DEFAULT_LOCALE,
}) => {
  const freechats = await fetchFreechats({ lang: locale });

  // Create a mapping of channelId to id for members
  const memberIdMap = new Map(
    members.map((member) => [member.channelId, member.id]),
  );

  // Sort the freechats array based on the memberIdMap
  freechats.sort((a, b) => {
    const aMemberId = memberIdMap.get(a.channelId) || 0;
    const bMemberId = memberIdMap.get(b.channelId) || 0;
    return aMemberId - bMemberId;
  });

  const translations = await serverSideTranslations(locale, [
    "common",
    "freechat",
  ]);
  const { t } = getInitializedI18nInstance(translations, "freechat");

  return {
    props: {
      ...translations,
      freechats: freechats,
      lastUpdateTimestamp: getCurrentUTCDate().getTime(),
      meta: {
        title: t("title"),
        description: t("description"),
      },
    },
  };
};

FreechatPage.getLayout = (page, pageProps) => (
  <ContentLayout
    title={pageProps.meta.title}
    description={pageProps.meta.description}
    lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
    path="/freechat"
    maxPageWidth="lg"
    padTop
  >
    {page}
  </ContentLayout>
);

export default FreechatPage;
