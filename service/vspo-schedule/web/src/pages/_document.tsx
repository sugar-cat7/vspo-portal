import Document, { Html, Head, Main, NextScript } from "next/document";
import { getInitColorSchemeScript } from "@mui/material/styles";
import i18nextConfig from "../../next-i18next.config";

class MyDocument extends Document {
  render() {
    const currentLocale =
      this.props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale}>
        <Head>
          {process.env.NODE_ENV === "production" && (
            <script
              async
              src={process.env.NEXT_PUBLIC_ADS_GOOGLE}
              crossOrigin="anonymous"
            />
          )}
          <meta charSet="utf-8" />
          <meta
            name="keywords"
            content="ぶいすぽっ！, ぶいすぽ, 配信スケジュール, VSPO!, Vspo, streaming schedule"
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://www.vspo-schedule.com/page-icon.png"
          />
          <meta property="twitter:card" content="summary_large_image" />
          <meta
            property="twitter:image"
            content="https://www.vspo-schedule.com/page-icon.png"
          />
          <meta name="robots" content="all" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon.png"></link>
          <meta name="theme-color" content="#fff" />
        </Head>
        <body>
          {getInitColorSchemeScript({ defaultMode: "system" })}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
