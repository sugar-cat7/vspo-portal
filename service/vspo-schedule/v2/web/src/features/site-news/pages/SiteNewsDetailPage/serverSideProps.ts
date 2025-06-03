import { siteNewsItems } from "@/data/content/site-news";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "@/lib/i18n/server";
import {
  generateStaticPathsForLocales,
  getInitializedI18nInstance,
} from "@/lib/utils";
import { SiteNewsItem } from "@/types/site-news";
import { GetStaticPaths, GetStaticProps } from "next";

type Params = {
  id: string;
};

export type SiteNewsDetailPageProps = {
  siteNewsItem: SiteNewsItem;
  meta: {
    title: string;
  };
};

export const getStaticProps: GetStaticProps<
  SiteNewsDetailPageProps,
  Params
> = async ({ params, locale = DEFAULT_LOCALE }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const id = params.id;
  const siteNewsItem = siteNewsItems.find(
    (siteNewsItem) => siteNewsItem.id === Number(id),
  );
  if (!siteNewsItem) {
    return {
      notFound: true,
    };
  }

  const translations = await serverSideTranslations(locale, [
    "common",
    "site-news",
  ]);
  const { t } = getInitializedI18nInstance(translations, "site-news");

  return {
    props: {
      ...translations,
      siteNewsItem,
      meta: {
        title: t("title"),
      },
    },
  };
};

// https://nextjs.org/docs/pages/building-your-application/routing/internationalization#how-does-this-work-with-static-generation
export const getStaticPaths: GetStaticPaths<Params> = ({ locales }) => {
  const paths = generateStaticPathsForLocales(
    siteNewsItems.map((item) => ({
      params: { id: item.id.toString() },
    })),
    locales,
  );
  return { paths, fallback: false };
};