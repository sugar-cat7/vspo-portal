import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import "@/styles/normalize.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { ThemeModeProvider } from "@/context/Theme";
import { GoogleAnalytics } from "@/components/Elements";
import { config } from "@fortawesome/fontawesome-svg-core";
import { TimeZoneContextProvider } from "@/context/TimeZoneContext";
import { VideoModalContextProvider } from "@/context/VideoModalContext";
import { appWithTranslation } from "next-i18next";

config.autoAddCss = false;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, pageProps: P) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <ThemeModeProvider>
        <TimeZoneContextProvider>
          <VideoModalContextProvider>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */}
            {getLayout(<Component {...pageProps} />, pageProps)}
          </VideoModalContextProvider>
        </TimeZoneContextProvider>
      </ThemeModeProvider>
      <Analytics />
      <GoogleAnalytics />
    </>
  );
}

export default appWithTranslation(App);
