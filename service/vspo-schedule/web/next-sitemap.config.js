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
    const clipsPaths = await generateClipsPaths();
    return [...schedulePaths, ...clipsPaths];
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

const locales = ["en", "cn", "ko", "tw"];

const generateSchedulePaths = async () => {
  const basePaths = [
    {
      loc: '/schedule/all',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  ];
  
  // Add paths for all locales
  const localePaths = locales.flatMap(locale => [
    {
      loc: `/${locale}/schedule/all`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  ]);
  
  return [...basePaths, ...localePaths];
};

const generateClipsPaths = async () => {
  const basePaths = [
    {
      loc: '/clips',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/clips/youtube',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/clips/twitch',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/clips/youtube/shorts',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  ];
  
  // Add paths for all locales
  const localePaths = locales.flatMap(locale => [
    {
      loc: `/${locale}/clips`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `/${locale}/clips/youtube`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `/${locale}/clips/twitch`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `/${locale}/clips/youtube/shorts`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  ]);
  
  return [...basePaths, ...localePaths];
};


