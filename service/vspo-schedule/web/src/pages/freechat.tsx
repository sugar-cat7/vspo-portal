import { LivestreamCard } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { formatDate } from "@/lib/utils";
import { GetStaticProps } from "next";
import React from "react";
import { NextPageWithLayout } from "./_app";
import { Livestream } from "@/types/streaming";
import { Grid } from "@mui/material";
import { members } from "@/data/members";
import { fetchFreechats } from "@/lib/api";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

type FreechatsProps = {
  freechats: Livestream[];
  lastUpdateDate: string;
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
  const freechats = await fetchFreechats();

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
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "freechat"])),
      freechats: freechats,
      lastUpdateDate: formatDate(new Date(), "yyyy/MM/dd HH:mm '(UTC)'"),
    },
  };
};

const FreechatLayout: React.FC<{
  pageProps: FreechatsProps;
  children: React.ReactNode;
}> = ({ pageProps, children }) => {
  const { t } = useTranslation("freechat");
  return (
    <ContentLayout
      title={t("title")}
      description={t("description")}
      lastUpdateDate={pageProps.lastUpdateDate}
      path="/freechat"
      maxPageWidth="lg"
      padTop
    >
      {children}
    </ContentLayout>
  );
};

FreechatPage.getLayout = (page, pageProps) => (
  <FreechatLayout pageProps={pageProps}>{page}</FreechatLayout>
);

export default FreechatPage;
