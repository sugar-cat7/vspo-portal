import { LivestreamCard } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { freeChatVideoIds } from "@/data/master";
import { mockFreeChats } from "@/data/freechats";
import { ENVIRONMENT, TEMP_TIMESTAMP } from "@/lib/Const";
import { formatWithTimeZone } from "@/lib/utils";
import { Box } from "@mui/system";
import { GetStaticProps } from "next";
import React from "react";
import { NextPageWithLayout } from "./_app";
import { Livestream } from "@/types/streaming";
import { Grid } from "@mui/material";
import { members } from "@/data/members";
import { fetchFreeChat } from "@/lib/api";

type FreeChatsProps = {
  freeChats: Livestream[];
  lastUpdateDate: string;
};

const FreeChatPage: NextPageWithLayout<FreeChatsProps> = ({ freeChats }) => {
  return (
    <>
      <Box
        sx={{
          padding: "24px",
          marginTop: "76px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={3} sx={{ maxWidth: "1152px" }}>
          {freeChats.map((freeChat) => (
            <Grid item xs={6} sm={6} md={3} lg={3} key={freeChat.id}>
              <LivestreamCard livestream={freeChat} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps<FreeChatsProps> = async () => {
  const freeChats = await fetchFreeChat();

  // Create a mapping of channelId to id for members
  const memberIdMap = new Map(
    members.map((member) => [member.channelId, member.id])
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
    >
      {page}
    </ContentLayout>
  );
};

export default FreeChatPage;
