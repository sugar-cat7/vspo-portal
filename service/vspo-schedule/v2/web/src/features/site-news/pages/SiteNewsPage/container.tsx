import { siteNewsItems } from "@/data/content/site-news";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import * as React from "react";
import { SiteNewsPagePresenter } from "./presenter";

export const SiteNewsPageContainer: React.FC = () => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LOCALE;
  const { t } = useTranslation("site-news");

  return (
    <SiteNewsPagePresenter
      siteNewsItems={siteNewsItems}
      locale={locale}
      t={t}
    />
  );
};