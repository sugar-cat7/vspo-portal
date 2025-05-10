import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Freechat } from "../../domain";
import { fetchFreechats } from "../../api";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { getInitializedI18nInstance } from "@/lib/utils";

export type FreechatPageProps = {
  freechats: Freechat[];
  lastUpdateTimestamp: number;
  meta: {
    title: string;
    description: string;
  };
};

export const getFreechatStaticProps: GetStaticProps<
  FreechatPageProps
> = async ({ locale = DEFAULT_LOCALE }) => {
  const [freechatResult, translationsResult] = await Promise.allSettled([
    fetchFreechats({ lang: locale }),
    serverSideTranslations(locale, ["common", "freechat"]),
  ]);

  // Check for errors in freechat API response
  if (freechatResult.status === "rejected") {
    console.error(
      "Failed to fetch freechats (rejected):",
      freechatResult.reason,
    );
  } else if (freechatResult.value.err) {
    console.error("Failed to fetch freechats:", freechatResult.value.err);
  }

  const freechats =
    freechatResult.status === "fulfilled" && !freechatResult.value.err
      ? freechatResult.value.val.freechats
      : [];

  // Check for errors in translations API response
  if (translationsResult.status === "rejected") {
    console.error("Failed to fetch translations:", translationsResult.reason);
  }

  const translations =
    translationsResult.status === "fulfilled" ? translationsResult.value : {};

  const { t } = getInitializedI18nInstance(
    translationsResult.status === "fulfilled" ? translations : {},
    "freechat",
  );

  return {
    props: {
      ...translations,
      freechats,
      lastUpdateTimestamp: getCurrentUTCDate().getTime(),
      meta: {
        title: t("title"),
        description: t("description"),
      },
    },
  };
};
