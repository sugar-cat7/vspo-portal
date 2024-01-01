import "@/styles/globals.css";
import "@/styles/normalize.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { ThemeModeProvider } from "@/context/Theme";
import { EmbedModeProvider } from "@/context/EmbedMode";
import { GoogleAnalytics } from "@/components/Elements";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, pageProps: P) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <EmbedModeProvider>
        <ThemeModeProvider>
          {getLayout(<Component {...pageProps} />, pageProps)}
        </ThemeModeProvider>
      </EmbedModeProvider>
      <Analytics />
      <GoogleAnalytics />
    </>
  );
}
