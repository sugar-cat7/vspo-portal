// next-sitemap.js
/** @type import("next-sitemap").IConfig */
module.exports = {
  siteUrl: "https://www.vspo-schedule.com",
  generateRobotsTxt: true,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.vspo-schedule.com/sitemap.xml"],
  },
  transform: (config, path) => {
    if (path.startsWith("/schedule") && path !== "/schedule/all") {
      return null;
    }
    if (path.startsWith("/ja/schedule") && path !== "/ja/schedule/all") {
      return null;
    }
    if (path.startsWith("/en/schedule") && path !== "/en/schedule/all") {
      return null;
    }
    return {
      loc: path,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      changefreq: config.changefreq,
      priority: config.priority,
    };
  },
};
