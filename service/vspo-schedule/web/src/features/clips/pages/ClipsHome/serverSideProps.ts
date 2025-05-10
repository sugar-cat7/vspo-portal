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

  // Get translations
  const translations = await serverSideTranslations(locale, [
    "common",
    "clips",
  ]);
  const { t } = getInitializedI18nInstance(translations, "clips");

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

  // Fetch all data for homepage with date filters
  const homePageDataResponse = await fetchHomePageData({
    afterPublishedAtDate: afterDate,
  });

  // Error handling
  if (homePageDataResponse.err) {
    console.error("Failed to fetch home page data:", homePageDataResponse.err);
    // Return empty data on error
    return {
      props: {
        popularYoutubeClips: [],
        popularShortsClips: [],
        popularTwitchClips: [],
        vspoMembers: [],
        lastUpdateTimestamp: getCurrentUTCDate().getTime(),
        meta: {
          title: t("home.meta.title", "ぶいすぽっ!クリップ集"),
          description: t(
            "home.meta.description",
            "ぶいすぽっ!メンバーのストリーム動画クリップ集。",
          ),
        },
        currentPeriod: period || "week",
        ...translations,
      } as ClipsHomeProps,
    };
  }

  // Return data fetched from API on success
  const {
    popularYoutubeClips,
    popularShortsClips,
    popularTwitchClips,
    vspoMembers,
  } = homePageDataResponse.val;

  // Meta content
  const title = t("home.meta.title", "ぶいすぽっ!クリップ集");
  const description = t(
    "home.meta.description",
    "ぶいすぽっ!メンバーのストリーム動画クリップ集。",
  );

  // Get the last update timestamp
  const lastUpdateTimestamp = getCurrentUTCDate().getTime();

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
