// This function will be called by the component with the translation function
export const getAboutSections = (t: (key: string) => string) => [
  {
    title: t("sections.siteOverview.title"),
    content: t("sections.siteOverview.content"),
  },
  {
    title: t("sections.contents.title"),
    content: t("sections.contents.content"),
  },
  {
    title: t("sections.linksAndScreenshots.title"),
    content: t("sections.linksAndScreenshots.content"),
  },
  {
    title: t("sections.dataUsage.title"),
    content: t("sections.dataUsage.content"),
  },
  {
    title: t("sections.features.title"),
    content: t("sections.features.content"),
  },
];
