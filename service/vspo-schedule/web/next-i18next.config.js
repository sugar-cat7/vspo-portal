// i18next.config.js
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["en", "ja"],
    localeDetection: false,
  },
  localePath: path.resolve("./public/locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
