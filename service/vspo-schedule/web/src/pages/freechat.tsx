import { LivestreamCard } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { formatWithTimeZone } from "@/lib/utils";
import { GetStaticProps } from "next";
import React from "react";
import { NextPageWithLayout } from "./_app";
import { Livestream } from "@/types/streaming";
import { Grid } from "@mui/material";
import { members } from "@/data/members";
import { fetchFreeChats } from "@/lib/api";

type FreeChatsProps = {
  freeChats: Livestream[];
  lastUpdateDate: string;
};

const FreeChatPage: NextPageWithLayout<FreeChatsProps> = ({ freeChats }) => {
  return (
    <Grid container spacing={3}>
      {freeChats.map((freeChat) => (
        <Grid item xs={6} md={3} key={freeChat.id}>
          <LivestreamCard livestream={freeChat} />
        </Grid>
      ))}
    </Grid>
  );
};

export const getStaticProps: GetStaticProps<FreeChatsProps> = async () => {
  const freeChats = await fetchFreeChats();

  // Create a mapping of channelId to id for members
  const memberIdMap = new Map(
    members.map((member) => [member.channelId, member.id]),
  );

  // Sort the freeChats array based on the memberIdMap
  freeChats.sort((a, b) => {
    const aMemberId = memberIdMap.get(a.channelId) || 0;
    const bMemberId = memberIdMap.get(b.channelId) || 0;
    return aMemberId - bMemberId;
  });
  return {
    props: {
      freeChats: freeChats,
      lastUpdateDate: formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd HH:mm"),
    },
  };
};

FreeChatPage.getLayout = (page, pageProps) => {
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

export default FreeChatPage;
