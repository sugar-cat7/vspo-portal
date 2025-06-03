import { aboutSections } from "@/data/content/about-sections";
import * as React from "react";
import { AboutPagePresenter } from "./presenter";

export const AboutPageContainer: React.FC = () => {
  return <AboutPagePresenter sections={aboutSections} />;
};