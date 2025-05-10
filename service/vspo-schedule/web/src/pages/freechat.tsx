import { ContentLayout } from "@/features/shared/components/Layout";
import { NextPageWithLayout } from "./_app";
import { FreechatPage } from "@/features/freechat";
import {
  getFreechatStaticProps,
  FreechatPageProps,
} from "@/features/freechat/pages/FreechatPage/serverSideProps";

const FreechatPageWrapper: NextPageWithLayout<FreechatPageProps> = (
  pageProps,
) => {
  return <FreechatPage freechats={pageProps.freechats} />;
};

FreechatPageWrapper.getLayout = (page, pageProps) => (
  <ContentLayout
    title={pageProps.meta.title}
    description={pageProps.meta.description}
    lastUpdateTimestamp={pageProps.lastUpdateTimestamp}
    path="/freechat"
    maxPageWidth="lg"
    padTop
  >
    {page}
  </ContentLayout>
);

export const getStaticProps = getFreechatStaticProps;

export default FreechatPageWrapper;
