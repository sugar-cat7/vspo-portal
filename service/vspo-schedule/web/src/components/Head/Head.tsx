import Head from "next/head";

type CustomHeadProps = {
  title?: string;
  description?: string;
  path?: string;
};

export const CustomHead = ({
  title = "",
  description = "",
  path = "",
}: CustomHeadProps = {}) => {
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
        content={`https://www.vspo-schedule.com${path}`}
      />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={description} />
    </Head>
  );
};
