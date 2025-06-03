import { ContentLayout } from "@/features/shared/components/Layout/ContentLayout";
import SiteNewsPageComponent from "@/features/site-news/pages/SiteNewsPage";
import {
  SiteNewsPageProps,
  getStaticProps as siteNewsGetStaticProps,
} from "@/features/site-news/pages/SiteNewsPage/serverSideProps";
import { NextPageWithLayout } from "../_app";

export const getStaticProps = siteNewsGetStaticProps;

const SiteNewsPage: NextPageWithLayout<SiteNewsPageProps> = () => {
  return <SiteNewsPageComponent />;
};

SiteNewsPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      path="/site-news"
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};

export default SiteNewsPage;
