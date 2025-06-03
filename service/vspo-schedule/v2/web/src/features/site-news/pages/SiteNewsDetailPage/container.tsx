import { DEFAULT_LOCALE } from "@/lib/Const";
import { SiteNewsItem } from "@/types/site-news";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import * as React from "react";
import { SiteNewsDetailPagePresenter } from "./presenter";

type SiteNewsDetailPageContainerProps = {
  siteNewsItem: SiteNewsItem;
};

export const SiteNewsDetailPageContainer: React.FC<
  SiteNewsDetailPageContainerProps
> = ({ siteNewsItem }) => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LOCALE;
  const { t } = useTranslation("site-news");

  return (
    <SiteNewsDetailPagePresenter
      siteNewsItem={siteNewsItem}
      locale={locale}
      t={t}
    />
  );
};