import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import nextI18NextConfig from "../../next-i18next.config";

// This is needed to prevent the "You will need to pass in an i18next instance by using initReactI18next" warning
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "ja",
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    ...nextI18NextConfig,
  });
}

export default i18n;
