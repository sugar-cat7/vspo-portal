import { GetStaticProps, GetStaticPaths } from "next";
import { SiteNewsItem } from "@/types/site-news";
import { ContentLayout } from "@/components/Layout";
import { NextPageWithLayout } from "../_app";
import { Typography, Chip, Box, Toolbar } from "@mui/material";
import { Breadcrumb, TweetEmbed } from "@/components/Elements";
import { siteNewsItems } from "@/data/content/site-news";
import {
  formatDate,
  generateStaticPathsForLocales,
  getInitializedI18nInstance,
  getSiteNewsTagColor,
} from "@/lib/utils";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

type Params = {
  id: string;
};

type Props = {
  siteNewsItem: SiteNewsItem;
  meta: {
    title: string;
  };
};

const SiteNewsItemPage: NextPageWithLayout<Props> = ({ siteNewsItem }) => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LOCALE;
  const { t } = useTranslation("site-news");

  const formattedDate = formatDate(siteNewsItem.updated, "PPP", {
    localeCode: locale,
  });

  return (
    <>
      <Toolbar disableGutters variant="dense" sx={{ alignItems: "end" }}>
        <Breadcrumb />
      </Toolbar>

      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ marginTop: "10px" }}
        >
          {siteNewsItem.title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t("updateDate")}: {formattedDate}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t("tags")}:
          {siteNewsItem.tags.map((tag) => (
            <Chip
              key={tag}
              label={t(`tagLabels.${tag}`)}
              variant="outlined"
              color={getSiteNewsTagColor(tag)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Typography>
        <Typography variant="body1" paragraph>
          {siteNewsItem.content}
        </Typography>
        {siteNewsItem.tweetLink && (
          <TweetEmbed tweetLink={siteNewsItem.tweetLink} />
        )}
      </Box>
    </>
  );
};

SiteNewsItemPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.siteNewsItem.content}
      path={`/site-news/${pageProps.siteNewsItem.id}`}
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
  locale = DEFAULT_LOCALE,
}) => {
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

export default SiteNewsItemPage;
