// next-sitemap.js
module.exports = {
  siteUrl: "https://www.vspo-schedule.com",
  generateRobotsTxt: true,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.vspo-schedule.com/sitemap.xml"],
  },
};
