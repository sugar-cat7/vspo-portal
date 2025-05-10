import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import "@/styles/normalize.css";
import { GoogleAnalytics } from "@/components/Elements";
import { ThemeModeProvider } from "@/context/Theme";
import { TimeZoneContextProvider } from "@/context/TimeZoneContext";
import { VideoModalContextProvider } from "@/context/VideoModalContext";
import { config } from "@fortawesome/fontawesome-svg-core";
import { AppCacheProvider } from "@mui/material-nextjs/v14-pagesRouter";
import { Analytics } from "@vercel/analytics/react";
import { NextPage } from "next";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";

config.autoAddCss = false;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, pageProps: P) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps, ...props }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <AppCacheProvider {...props}>
        <ThemeModeProvider>
          <TimeZoneContextProvider>
            <VideoModalContextProvider>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */}
              {getLayout(<Component {...pageProps} />, pageProps)}
            </VideoModalContextProvider>
          </TimeZoneContextProvider>
        </ThemeModeProvider>
      </AppCacheProvider>
      <Analytics />
      <GoogleAnalytics />
    </>
  );
}

export default appWithTranslation(App);
