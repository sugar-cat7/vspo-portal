import { LivestreamCard } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { formatWithTimeZone } from "@/lib/utils";
import { GetStaticProps } from "next";
import React from "react";
import { NextPageWithLayout } from "./_app";
import { Livestream } from "@/types/streaming";
import { Grid } from "@mui/material";
import { members } from "@/data/members";
import { fetchFreechats } from "@/lib/api";

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

export const getStaticProps: GetStaticProps<FreechatsProps> = async () => {
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
      freechats: freechats,
      lastUpdateDate: formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd HH:mm"),
    },
  };
};

FreechatPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title="ぶいすぽっ!フリーチャット"
      description="ぶいすぽっ!メンバーのフリーチャットを確認できます。"
      lastUpdateDate={pageProps.lastUpdateDate}
      path="/freechat"
      maxPageWidth="lg"
      padTop
    >
      {page}
    </ContentLayout>
  );
};

export default FreechatPage;
