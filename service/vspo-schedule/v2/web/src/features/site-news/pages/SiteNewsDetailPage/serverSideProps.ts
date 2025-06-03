import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "@/lib/i18n/server";
import {
  getAllMarkdownSlugs,
  getSiteNewsItem,
  SiteNewsMarkdownItem,
} from "@/lib/markdown";
import {
  generateStaticPathsForLocales,
  getInitializedI18nInstance,
} from "@/lib/utils";
import { GetStaticPaths, GetStaticProps } from "next";

type Params = {
  id: string;
};

export type SiteNewsDetailPageProps = {
  siteNewsItem: SiteNewsMarkdownItem;
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
  const siteNewsItem = await getSiteNewsItem(locale, id);
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
  const slugs = getAllMarkdownSlugs("site-news");
  const paths = generateStaticPathsForLocales(
    slugs.map((slug) => ({
      params: { id: slug },
    })),
    locales,
  );
  return { paths, fallback: false };
};