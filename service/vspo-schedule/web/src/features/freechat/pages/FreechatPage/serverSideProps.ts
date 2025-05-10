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
  const freechatResult = await fetchFreechats({ lang: locale });

  if (freechatResult.err) {
    return {
      props: {
        freechats: [],
        lastUpdateTimestamp: getCurrentUTCDate().getTime(),
        meta: {
          title: "",
          description: "",
        },
      },
    };
  }

  const { freechats } = freechatResult.val;

  const translations = await serverSideTranslations(locale, [
    "common",
    "freechat",
  ]);
  const { t } = getInitializedI18nInstance(translations, "freechat");

  return {
    props: {
      ...translations,
      freechats: freechats,
      lastUpdateTimestamp: getCurrentUTCDate().getTime(),
      meta: {
        title: t("title"),
        description: t("description"),
      },
    },
  };
};
