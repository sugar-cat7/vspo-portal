const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.vspo-schedule\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "vspo-schedule",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60, // 1 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});
module.exports = withPWA({
  reactStrictMode: true,
  transpilePackages: ["react-tweet"],
  images: {
    domains: [
      "i.ytimg.com",
      "localhost",
      "play-lh.googleusercontent.com",
      "vod-secure.twitch.tv",
      "static-cdn.jtvnw.net",
      "imagegw03.twitcasting.tv",
      "secure-dcdn.cdn.nimg.jp",
      "yt3.googleusercontent.com",
      "yt3.ggpht.com",
      "clips-media-assets2.twitch.tv",
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/schedule/all",
        permanent: true,
      },
    ];
  },
});
