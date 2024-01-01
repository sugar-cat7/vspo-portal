// i18next.config.js
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["en", "ja"],
  },
  localePath: path.resolve("./public/locales"),
};
