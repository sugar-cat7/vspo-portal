import { DISCORD_LINK, QA_LINK } from "@/lib/Const";
import { formatWithTimeZone } from "@/lib/utils";

const internalRoutes = {
  list: "/schedule/all",
  archive: "/schedule/archive",
  live: "/schedule/live",
  upcoming: "/schedule/upcoming",
  freechat: "/freechat",
  clip: "/clips",
  "twitch-clip": "/twitch-clips",
  get event() {
    return `/events/${formatWithTimeZone(new Date(), "ja", "yyyy-MM")}`;
  },
  about: "/about",
  "site-news": "/site-news",
} as const satisfies Record<string, string>;

const externalRoutes = {
  qa: QA_LINK,
  discord: DISCORD_LINK,
} as const satisfies Record<string, string | undefined>;

const navigationRoutes = { ...internalRoutes, ...externalRoutes } as const;

export type NavigationRouteId = keyof typeof navigationRoutes;

export const getNavigationRouteInfo = (id: NavigationRouteId) => ({
  link: navigationRoutes[id] || "",
  isExternalLink: id in externalRoutes,
});
