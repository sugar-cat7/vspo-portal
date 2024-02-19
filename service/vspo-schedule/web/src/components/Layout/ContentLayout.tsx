import * as React from "react";

import { CustomHead } from "../Head/Head";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { GoogleAd } from "../Elements/Google/GoogleAd";
import { CustomBottomNavigation } from "@/components/Layout/Navigation";

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
  lastUpdateDate?: string;
  description?: string;
  path?: string;
  footerMessage?: string;
  headTitle?: string;
};

export const ContentLayout = ({
  children,
  title,
  lastUpdateDate,
  description,
  path,
  footerMessage,
  headTitle,
}: ContentLayoutProps) => {
  return (
    <>
      <CustomHead
        title={headTitle ? headTitle : `${title}`}
        description={description}
        path={path}
      />
      <Header title={title} />
      <main>{children}</main>
      <GoogleAd />
      <Footer lastUpdateDate={lastUpdateDate} description={footerMessage} />
      <CustomBottomNavigation />
    </>
  );
};
