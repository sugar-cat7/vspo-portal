import { LivestreamCard } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { formatDate, getInitializedI18nInstance } from "@/lib/utils";
import { GetStaticProps } from "next";
import React from "react";
import { NextPageWithLayout } from "./_app";
import { Livestream } from "@/types/streaming";
import { Grid } from "@mui/material";
import { members } from "@/data/members";
import { fetchFreechats } from "@/lib/api";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type FreechatsProps = {
  freechats: Livestream[];
  lastUpdateDate: string;
  meta: {
    title: string;
    description: string;
  };
};

const FreechatPage: NextPageWithLayout<FreechatsProps> = ({ freechats }) => {
  return (
    <Grid container spacing={3}>
      {freechats.map((freechat) => (
        <Grid item xs={6} md={3} key={freechat.id}>
          <LivestreamCard livestream={freechat} />
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
      lastUpdateDate: formatDate(new Date(), "yyyy/MM/dd HH:mm '(UTC)'"),
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
    lastUpdateDate={pageProps.lastUpdateDate}
    path="/freechat"
    maxPageWidth="lg"
    padTop
  >
    {page}
  </ContentLayout>
);

export default FreechatPage;
