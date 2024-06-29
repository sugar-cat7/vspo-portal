import { GetStaticProps, GetStaticPaths } from "next";
import { SiteNewsItem } from "@/types/site-news";
import { ContentLayout } from "@/components/Layout";
import { NextPageWithLayout } from "../_app";
import { Typography, Chip, Box, Toolbar } from "@mui/material";
import { Breadcrumb, TweetEmbed } from "@/components/Elements";
import { siteNewsItems } from "@/data/content/site-news";
import { getColor } from "@/lib/utils";

type Params = {
  id: string;
};

type Props = {
  siteNewsItem: SiteNewsItem;
};

const SiteNewsItemPage: NextPageWithLayout<Props> = ({ siteNewsItem }) => {
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
          更新日: {siteNewsItem.updated}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Tags:
          {siteNewsItem.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              color={getColor(tag)}
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
      title="すぽじゅーるからのお知らせ"
      description={pageProps.siteNewsItem.content}
      path={`/site-news/${pageProps.siteNewsItem.id}`}
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};

export const getStaticProps: GetStaticProps<Props, Params> = ({ params }) => {
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

  return {
    props: {
      siteNewsItem,
    },
  };
};

// https://nextjs.org/docs/pages/building-your-application/routing/internationalization#how-does-this-work-with-static-generation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getStaticPaths: GetStaticPaths<Params> = ({ locales }) => {
  const paths = siteNewsItems.map((siteNewsItem) => ({
    params: { id: siteNewsItem.id.toString() },
  }));
  return { paths, fallback: false };
};

export default SiteNewsItemPage;
