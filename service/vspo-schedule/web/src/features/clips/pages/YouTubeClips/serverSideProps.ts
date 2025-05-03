import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { getInitializedI18nInstance } from "@/lib/utils";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { YouTubeClipsProps } from "./container";
import { fetchClips } from "../../api";
import { paginateClips } from "../../utils";

// Server-side logic for data fetching
const getServerSideProps: GetServerSideProps<YouTubeClipsProps> = async ({
  locale = DEFAULT_LOCALE,
  query,
}) => {
  // Get the current page from query params or default to 1
  const currentPage = query.page ? parseInt(query.page as string, 10) : 0;
  const sortOption = (query.sort as string) || "desc";

  // Items per page for server-side pagination
  const ITEMS_PER_PAGE = 24;

  // Get translations
  const translations = await serverSideTranslations(locale, [
    "common",
    "clips",
  ]);
  const { t } = getInitializedI18nInstance(translations, "clips");

  // Fetch clips from API
  const clips = await fetchClips({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    platform: "youtube",
    locale: "default",
  });

  if (!clips.val) {
    return {
      props: {
        ...translations,
        clips: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE,
        },
        lastUpdateTimestamp: getCurrentUTCDate().getTime(),
        meta: {
          title: t("youtubeClips.title"),
          description: t("youtubeClips.description"),
        },
        sortOption,
      },
    };
  }

  // Apply pagination
  const { clips: paginatedClips, pagination } = paginateClips(
    clips.val.clips,
    currentPage,
    ITEMS_PER_PAGE,
  );

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

export default getServerSideProps;
