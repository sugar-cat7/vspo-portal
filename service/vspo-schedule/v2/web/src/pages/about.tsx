import AboutPageComponent from "@/features/about/pages/AboutPage";
import {
  AboutPageProps,
  getStaticProps as aboutGetStaticProps,
} from "@/features/about/pages/AboutPage/serverSideProps";
import { ContentLayout } from "@/features/shared/components/Layout";
import { NextPageWithLayout } from "./_app";

export const getStaticProps = aboutGetStaticProps;

const AboutPage: NextPageWithLayout<AboutPageProps> = ({ sections }) => {
  return <AboutPageComponent sections={sections} />;
};

AboutPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      path="/about"
      maxPageWidth="md"
      padTop
    >
      {page}
    </ContentLayout>
  );
};

export default AboutPage;
