import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { getInitializedI18nInstance } from "@/lib/utils";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { fetchClips } from "../../api";
import { YouTubeClipsProps } from "./container";

// Get date for N days ago in ISO format
const getDaysAgoISO = (days: number): string => {
  const date = getCurrentUTCDate();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

type YouTubeClipOptions = {
  type?: "clip" | "short";
  order?: "asc" | "desc";
  orderKey?: "publishedAt" | "viewCount";
};

// Server-side logic for data fetching
// NOTE: Not included in barrel exports because it contains node:fs internally
export const getYouTubeClipsServerSideProps = (options: YouTubeClipOptions) => {
  return async (context: GetServerSidePropsContext) => {
    const locale = context.locale || DEFAULT_LOCALE;

    // Get sort option from query params (default to "new")
    const order =
      (Array.isArray(context.query.order)
        ? context.query.order[0]
        : context.query.order) || "desc";
    const orderKey =
      (Array.isArray(context.query.orderKey)
        ? context.query.orderKey[0]
        : context.query.orderKey) || "publishedAt";

    // Get page number from query params (default to 0)
    const page = parseInt(
      Array.isArray(context.query.page)
        ? context.query.page[0]
        : context.query.page || "0",
      10,
    );

    // Get period filter from query parameters
    const period =
      (Array.isArray(context.query.period)
        ? context.query.period[0]
        : context.query.period) || "week";

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

    const ITEMS_PER_PAGE = 24;

    // Get translations
    const translations = await serverSideTranslations(locale, [
      "common",
      "clips",
    ]);
    const { t } = getInitializedI18nInstance(translations, "clips");

    // Get clip type from options (default to "clip")
    const clipType = options?.type || "clip";

    // Fetch clips
    const response = await fetchClips({
      platform: "youtube",
      page,
      limit: ITEMS_PER_PAGE,
      clipType,
      order: order as "asc" | "desc",
      orderKey: orderKey as "publishedAt" | "viewCount",
      afterPublishedAtDate: afterDate,
    });

    // Format the clips
    const clips = response.val ? response.val.clips : [];

    // Meta content
    const title =
      clipType === "short" ? t("youtubeShorts.title") : t("youtubeClips.title");
    const description =
      clipType === "short"
        ? t("youtubeShorts.description")
        : t("youtubeClips.description");

    // Get the last update timestamp
    const lastUpdateTimestamp = getCurrentUTCDate().getTime();

    // Pagination
    const pagination = response.val
      ? response.val.pagination
      : {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE,
        };

    return {
      props: {
        clips,
        lastUpdateTimestamp,
        meta: {
          title,
          description,
        },
        pagination,
        order: order || "desc",
        orderKey: orderKey || "publishedAt",
        currentPeriod: period,
        ...translations,
      } as YouTubeClipsProps,
    };
  };
};
