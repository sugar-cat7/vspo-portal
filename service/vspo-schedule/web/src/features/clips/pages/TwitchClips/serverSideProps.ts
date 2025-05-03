import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { TwitchClipsProps } from "./container";
import { paginateClips } from "../../utils/clipUtils";
import { fetchClips } from "../../api";

// Default fallback titles and descriptions
const DEFAULT_TITLE = "Twitch Clips";
const DEFAULT_DESCRIPTION = "Watch the latest Twitch clips from VSPO members";

// Server-side logic for data fetching
const getServerSideProps: GetServerSideProps<TwitchClipsProps> = async ({
  locale = DEFAULT_LOCALE as string,
  query,
}) => {
  // Get the current page from query params or default to 1
  const currentPage = query.page ? parseInt(query.page as string, 10) : 0;
  const sortOption = (query.sort as string) || "desc";

  // Items per page for server-side pagination
  const ITEMS_PER_PAGE = 24;

  // Get translations
  const translations = await serverSideTranslations(locale || DEFAULT_LOCALE, [
    "common",
    "clips",
  ]);

  // Fetch clips from API
  const clipsResult = await fetchClips({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    platform: "twitch",
    locale: "default",
  });

  // Handler function for getCurrentUTCDate to avoid repeated type assertions
  const getTimestamp = (): number => {
    return getCurrentUTCDate().getTime();
  };

  // Handle API error
  if (!clipsResult.val) {
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
        lastUpdateTimestamp: getTimestamp(),
        meta: {
          title: DEFAULT_TITLE,
          description: DEFAULT_DESCRIPTION,
        },
        sortOption: "new",
      },
    };
  }

  // Apply pagination
  const { clips: paginatedClips, pagination } = paginateClips(
    clipsResult.val.clips,
    currentPage,
    ITEMS_PER_PAGE,
  );

  return {
    props: {
      ...translations,
      clips: paginatedClips,
      pagination,
      lastUpdateTimestamp: getTimestamp(),
      meta: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
      },
      sortOption,
    },
  };
};

export default getServerSideProps;
