import { getAboutSections } from "@/data/content/about-sections";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { AboutPagePresenter } from "./presenter";

export const AboutPageContainer: React.FC = () => {
  const { t } = useTranslation("about");
  const sections = getAboutSections(t);
  
  return <AboutPagePresenter sections={sections} />;
};