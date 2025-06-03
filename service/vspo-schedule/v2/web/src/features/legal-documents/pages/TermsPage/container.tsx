import { useTranslation } from "next-i18next";
import * as React from "react";
import { TermsPagePresenter } from "./presenter";

export const TermsPageContainer: React.FC = () => {
  const { t } = useTranslation("terms");
  return <TermsPagePresenter t={t} />;
};