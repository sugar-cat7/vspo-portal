// next-sitemap.js
/** @type import("next-sitemap").IConfig */
module.exports = {
  siteUrl: "https://www.vspo-schedule.com",
  generateRobotsTxt: true,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.vspo-schedule.com/sitemap.xml"],
  },
  additionalPaths: async () => {
    const schedulePaths = await generateSchedulePaths();
    return [...schedulePaths];
  },
  transform: (config, path) => {
    return {
      loc: path,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      changefreq: config.changefreq,
      priority: config.priority,
    };
  },
};

const generateSchedulePaths = async () => {
  return [
    {
      loc: '/schedule/all',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/en/schedule/all',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
  ];
};
