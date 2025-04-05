import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";

export const initI18n = async ({ language }: { language: string }) => {
  let translation: unknown;
  if (language === "ja") {
    translation = await import("../../public/locales/ja/discord.json");
  } else if (language === "en") {
    translation = await import("../../public/locales/en/discord.json");
  } else if (language === "cn") {
    translation = await import("../../public/locales/cn/discord.json");
  } else if (language === "de") {
    translation = await import("../../public/locales/de/discord.json");
  } else if (language === "es") {
    translation = await import("../../public/locales/es/discord.json");
  } else if (language === "fr") {
    translation = await import("../../public/locales/fr/discord.json");
  } else if (language === "ko") {
    translation = await import("../../public/locales/ko/discord.json");
  } else if (language === "tw") {
    translation = await import("../../public/locales/tw/discord.json");
  } else {
    translation = await import("../../public/locales/default/discord.json");
  }

  try {
    await i18next
      .use(
        resourcesToBackend(
          () => (translation as { default: Record<string, unknown> }).default,
        ),
      )
      .init({
        lng: language,
        fallbackLng: "en",
        ns: ["discord"],
        defaultNS: "discord",
        interpolation: { escapeValue: false },
      });

    console.log(`i18n initialized with language: ${language}`);
    return i18next;
  } catch (error) {
    console.error("Failed to initialize i18n:", error);
    throw error;
  }
};
