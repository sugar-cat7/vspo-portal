// @ts-check

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

const { i18n } = require('./next-i18next.config');

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-tweet"],
  images: {
    remotePatterns: [
      { hostname: "localhost", protocol: "http", port: "3000" },
      ...[
        "i.ytimg.com",
        "play-lh.googleusercontent.com",
        "vod-secure.twitch.tv",
        "static-cdn.jtvnw.net",
        "imagegw03.twitcasting.tv",
        "secure-dcdn.cdn.nimg.jp",
        "yt3.googleusercontent.com",
        "yt3.ggpht.com",
        "clips-media-assets2.twitch.tv",
      ].map((hostname) => ({
        hostname,
        /** @type {"https"} */
        protocol: "https",
        port: "",
      })),
    ],
  },
  i18n,
  skipMiddlewareUrlNormalize: true,
  experimental: {
    scrollRestoration: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/schedule/all",
        permanent: true,
      },
      {
        source: "/notifications/:id*",
        destination: "/site-news/:id*",
        permanent: true,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
