import { Loading, SearchDialog } from "@/components/Elements";
import { ContentLayout } from "@/components/Layout";
import { ClipTabs } from "@/components/Templates";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { mapApiClipsToClips } from "@/lib/api/dto";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { getInitializedI18nInstance } from "@/lib/utils";
import { Clip } from "@/types/streaming";
import { Box } from "@mui/system";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect } from "react";
import { NextPageWithLayout } from "./_app";
import { VSPOApi } from "@vspo-lab/api";
import { Result } from "@vspo-lab/error";

type ClipsProps = {
  clips: Clip[];
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  sortOption: string;
};

const ClipPage: NextPageWithLayout<ClipsProps> = ({ 
  clips, 
  pagination, 
  sortOption 
}) => {
  const [isProcessing, setIsProcessing] = React.useState<boolean>(true);
  
  useEffect(() => {
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
      ) : clips.length === 0 ? (
        <Box
          sx={{
            mt: 2,
            padding: "0 50px 50px",
          }}
        >
          {t("noClips")}
        </Box>
      ) : (
        <ClipTabs 
          clips={clips} 
          pagination={pagination}
          initialSortOption={sortOption}
        />
      )}
      <SearchDialog
        setIsProcessing={setIsProcessing}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ClipsProps> = async ({
  locale = DEFAULT_LOCALE,
  query,
}) => {
  // Get the current page from query params or default to 1
  const currentPage = query.page ? parseInt(query.page as string, 10) : 1;
  const sortOption = (query.sort as string) || "new";
  
  // Initialize API client
  const client = new VSPOApi({
    apiKey: process.env.API_KEY,
    baseUrl: process.env.API_URL,
  });

  // Items per page for server-side pagination
  const ITEMS_PER_PAGE = 24;

  // Get translations
  const translations = await serverSideTranslations(locale, [
    "common",
    "clips",
  ]);
  const { t } = getInitializedI18nInstance(translations, "clips");

  // Get clips for the current page
  const clipsResult = await client.clips.list({
    limit: ITEMS_PER_PAGE.toString(),
    page: currentPage.toString(),
    platform: "youtube",
    clipType: "clip",
    languageCode: locale,
    orderBy: "desc",
  });

  // Handle API error with Result pattern
  if (clipsResult.err || !clipsResult.val) {
    return {
      props: {
        ...translations,
        clips: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE,
        },
        lastUpdateTimestamp: getCurrentUTCDate().getTime(),
        meta: {
          title: t("youtubeClips.title"),
          description: t("youtubeClips.description"),
        },
        sortOption: "new",
      },
    };
  }

  // Convert API response to Clip type
  const clips = mapApiClipsToClips(clipsResult);

  // Client-side sorting based on sortOption
  let sortedClips = [...clips];
  if (sortOption === "popular") {
    // Sort by view count if that's what the user requested
    sortedClips = sortedClips.sort((a, b) => {
      const aViews = parseInt(a.viewCount || "0", 10);
      const bViews = parseInt(b.viewCount || "0", 10);
      return bViews - aViews;
    });
  } else if (sortOption === "recommended") {
    // For recommended, we can use a pseudo-random sort
    const seedDate = new Date().getDate();
    let seed = seedDate;
    sortedClips = sortedClips.sort(() => Math.sin(seed++) * 0.5);
  }

  // Apply search filters if any
  let filteredClips = sortedClips;

  // Process additional query parameters for filtering
  if (query.members) {
    const memberIds = Array.isArray(query.members) 
      ? query.members.map(id => id.toString())
      : [query.members as string];
    
    filteredClips = filteredClips.filter(clip => 
      memberIds.some(id => clip.channelId === id)
    );
  }

  if (query.keyword) {
    const keyword = (query.keyword as string).toLowerCase();
    filteredClips = filteredClips.filter(clip => 
      clip.title.toLowerCase().includes(keyword) || 
      (clip.description && clip.description.toLowerCase().includes(keyword))
    );
  }

  if (query.timeframe) {
    const timeframe = query.timeframe as string;
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeframe === "1day") {
      cutoffDate.setDate(now.getDate() - 1);
    } else if (timeframe === "1week") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeframe === "1month") {
      cutoffDate.setMonth(now.getMonth() - 1);
    }
    
    filteredClips = filteredClips.filter(clip => {
      if (!clip.createdAt) return true;
      const clipDate = new Date(clip.createdAt);
      return clipDate >= cutoffDate;
    });
  }

  // Calculate total items after all filtering
  const totalItems = filteredClips.length;
  
  // Apply pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClips = filteredClips.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Prepare pagination info
  const pagination = {
    currentPage,
    totalPages: Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)),
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
  };

  return {
    props: {
      ...translations,
      clips: paginatedClips,
      pagination,
      lastUpdateTimestamp: getCurrentUTCDate().getTime(),
      meta: {
        title: t("youtubeClips.title"),
        description: t("youtubeClips.description"),
      },
      sortOption,
    },
  };
};

ClipPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
      path="/clips"
    >
      {page}
    </ContentLayout>
  );
};

export default ClipPage;
