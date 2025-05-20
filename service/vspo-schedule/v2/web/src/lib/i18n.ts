import { getCloudflareContext } from "@opennextjs/cloudflare";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import nextI18NextConfig from "../../next-i18next.config";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "ja",
    fallbackLng: "en",
    debug: getCloudflareContext().env.ENV === "development",
    ...nextI18NextConfig,
  });
}

export default i18n;
