import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { getInitializedI18nInstance, getSessionId } from "@/lib/utils";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { fetchClips } from "../../api";
import { paginateClips } from "../../utils/clipUtils";
import { TwitchClipsProps } from "./container";

// Get date for N days ago in ISO format
const getDaysAgoISO = (days: number): string => {
  const date = getCurrentUTCDate();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Server-side logic for data fetching
// NOTE: Not included in barrel exports because it contains node:fs internally
export const getTwitchClipsServerSideProps: GetServerSideProps<
  TwitchClipsProps
> = async ({ locale = DEFAULT_LOCALE as string, query, req }) => {
  // Get the current page from query params or default to 1
  const currentPage = query.page ? parseInt(query.page as string, 10) : 0;

  // Provide default values to prevent undefined values
  const order = (query.order as "asc" | "desc") || "desc";
  const orderKey =
    (query.orderKey as "publishedAt" | "viewCount") || "viewCount";

  // Get period filter from query parameters
  const period = (query.period as string) || "week";

  // Set date filters based on period
  let afterDate: string | undefined;

  switch (period) {
    case "day":
      afterDate = getDaysAgoISO(1);
      break;
    case "week":
      afterDate = getDaysAgoISO(7);
      break;
    case "month":
      afterDate = getDaysAgoISO(30);
      break;
    case "year":
      afterDate = getDaysAgoISO(365);
      break;
    case "all":
    default:
      afterDate = undefined;
      break;
  }

  // Items per page for server-side pagination
  const ITEMS_PER_PAGE = 24;

  // Get translations
  const translations = await serverSideTranslations(locale, [
    "common",
    "clips",
  ]);
  const { t } = getInitializedI18nInstance(translations, "clips");

  // Fetch clips from API
  const clipsResult = await fetchClips({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    platform: "twitch",
    clipType: "clip",
    order: order,
    orderKey: orderKey,
    afterPublishedAtDate: afterDate,
    sessionId: getSessionId(req),
  });

  // Handler function for getCurrentUTCDate to avoid repeated type assertions
  const getTimestamp = (): number => {
    return getCurrentUTCDate().getTime();
  };

  // Handle API error
  if (!clipsResult.val) {
    console.error("Failed to fetch Twitch clips:", clipsResult.err);
    return {
      props: {
        ...translations,
        clips: [],
        pagination: {
          currentPage: 0, // Use 0-indexed pagination
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE,
        },
        lastUpdateTimestamp: getTimestamp(),
        meta: {
          title: t("twitchClips.title"),
          description: t("twitchClips.description"),
        },
        order: order,
        orderKey: orderKey,
        currentPeriod: period,
      },
    };
  }

  // Get the total count from the API response
  const totalItems = clipsResult.val.pagination.totalItems;

  // Apply pagination with the total count from the API
  const { clips: paginatedClips, pagination } = paginateClips(
    clipsResult.val.clips,
    currentPage,
    ITEMS_PER_PAGE,
    totalItems,
  );

  return {
    props: {
      ...translations,
      clips: paginatedClips,
      pagination,
      lastUpdateTimestamp: getTimestamp(),
      meta: {
        title: t("twitchClips.title"),
        description: t("twitchClips.description"),
      },
      order: order,
      orderKey: orderKey,
      currentPeriod: period,
    },
  };
};
