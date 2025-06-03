import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "@/lib/i18n/server";
import { getInitializedI18nInstance } from "@/lib/utils";
import { GetStaticProps } from "next";

export type SiteNewsPageProps = {
  meta: {
    title: string;
    description: string;
  };
};

export const getStaticProps: GetStaticProps<SiteNewsPageProps> = async ({
  locale = DEFAULT_LOCALE,
}) => {
  const translations = await serverSideTranslations(locale, [
    "common",
    "site-news",
  ]);
  const { t } = getInitializedI18nInstance(translations, "site-news");

  return {
    props: {
      ...translations,
      meta: {
        title: t("title"),
        description: t("description"),
      },
    },
  };
};