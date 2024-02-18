import Head from "next/head";
import { useRouter } from "next/router";

type CustomHeadProps = {
  title?: string;
  description?: string;
};

export const CustomHead = ({
  title = "",
  description = "",
}: CustomHeadProps = {}) => {
  const router = useRouter();
  const pageTitle = title
    ? `すぽじゅーる | ${title}`
    : "すぽじゅーる - ぶいすぽ";

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta
        property="og:url"
        content={`https://www.vspo-schedule.com${router.asPath}`}
      />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={description} />
    </Head>
  );
};
