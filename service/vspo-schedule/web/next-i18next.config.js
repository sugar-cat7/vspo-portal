// i18next.config.js
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["en", "ja"],
    localeDetection: true,
  },
  localePath: path.resolve("./public/locales"),
};
