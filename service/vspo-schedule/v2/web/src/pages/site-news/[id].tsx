import { ContentLayout } from "@/features/shared/components/Layout";
import SiteNewsDetailPageComponent from "@/features/site-news/pages/SiteNewsDetailPage";
import {
  SiteNewsDetailPageProps,
  getStaticPaths,
  getStaticProps as siteNewsDetailGetStaticProps,
} from "@/features/site-news/pages/SiteNewsDetailPage/serverSideProps";
import { NextPageWithLayout } from "../_app";

export const getStaticProps = siteNewsDetailGetStaticProps;
export { getStaticPaths };

const SiteNewsItemPage: NextPageWithLayout<SiteNewsDetailPageProps> = ({
  siteNewsItem,
}) => {
  return <SiteNewsDetailPageComponent siteNewsItem={siteNewsItem} />;
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

export default SiteNewsItemPage;
