import * as React from "react";

import { CustomHead } from "../Head/Head";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { GoogleAd } from "../Elements/Google/GoogleAd";

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
  lastUpdateDate?: string;
  description?: string;
  footerMessage?: string;
  headTitle?: string;
};

export const ContentLayout = ({
  children,
  title,
  lastUpdateDate,
  description,
  footerMessage,
  headTitle,
}: ContentLayoutProps) => {
  return (
    <>
      <CustomHead title={headTitle || title} description={description} />
      <Header title={title} />
      <main>{children}</main>
      <GoogleAd />
      <Footer lastUpdateDate={lastUpdateDate} description={footerMessage} />
    </>
  );
};
