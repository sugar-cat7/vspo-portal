// i18next.config.js
const path = require("path");

const config = {
  i18n: {
    defaultLocale: "default",
    locales: ["default", "en", "ja", "cn", "tw", "ko"],
    localeDetection: false,
  },
  localePath: typeof window === 'undefined'? path.resolve("./public/locales"): "/locales",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};

module.exports = config;
