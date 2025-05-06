import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { getInitializedI18nInstance } from "@/lib/utils";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { fetchHomePageData } from "../../api";
import { ClipsHomeProps } from "./container";

// Get date for N days ago in ISO format
const getDaysAgoISO = (days: number): string => {
  const date = getCurrentUTCDate();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const locale = context.locale || DEFAULT_LOCALE;

  // Get date range from query parameters or default to 1 week
  const period = (context.query.period as string) || "week";

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

  // Fetch translations and home page data in parallel
  const [translationsResult, homePageDataResult] = await Promise.allSettled([
    serverSideTranslations(locale, ["common", "clips"]),
    fetchHomePageData({
      afterPublishedAtDate: afterDate,
    }),
  ]);

  // Extract results or use defaults
  const translations =
    translationsResult.status === "fulfilled" ? translationsResult.value : {};
  const homePageData =
    homePageDataResult.status === "fulfilled"
      ? homePageDataResult.value
      : { err: true };

  // Get translations instance
  const { t } = getInitializedI18nInstance(translations, "clips");

  // Meta content
  const title = t("home.meta.title", "ぶいすぽっ!クリップ集");
  const description = t(
    "home.meta.description",
    "ぶいすぽっ!メンバーのストリーム動画クリップ集。",
  );

  // Get the last update timestamp
  const lastUpdateTimestamp = getCurrentUTCDate().getTime();

  // Error handling
  if (homePageData.err) {
    console.error("Failed to fetch home page data:", homePageData.err);
    // Return empty data on error
    return {
      props: {
        popularYoutubeClips: [],
        popularShortsClips: [],
        popularTwitchClips: [],
        vspoMembers: [],
        lastUpdateTimestamp,
        meta: {
          title,
          description,
        },
        currentPeriod: period || "week",
        ...translations,
      } as ClipsHomeProps,
    };
  }

  // Return data fetched from API on success
  const {
    popularYoutubeClips = [],
    popularShortsClips = [],
    popularTwitchClips = [],
    vspoMembers = [],
  } = "val" in homePageData ? homePageData.val : {};

  return {
    props: {
      popularYoutubeClips,
      popularShortsClips,
      popularTwitchClips,
      vspoMembers,
      lastUpdateTimestamp,
      meta: {
        title,
        description,
      },
      currentPeriod: period || "week",
      ...translations,
    },
  };
};
