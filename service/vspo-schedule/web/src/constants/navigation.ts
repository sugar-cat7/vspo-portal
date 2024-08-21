import { DISCORD_LINK, QA_LINK } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { formatDate } from "@/lib/utils";

const internalRoutes = {
  list: "/schedule/all",
  archive: "/schedule/archive",
  live: "/schedule/live",
  upcoming: "/schedule/upcoming",
  freechat: "/freechat",
  clip: "/clips",
  "twitch-clip": "/twitch-clips",
  event: (timeZone: string) =>
    `/events/${formatDate(getCurrentUTCDate(), "yyyy-MM", { timeZone })}`,
  about: "/about",
  "site-news": "/site-news",
} as const;

const externalRoutes = {
  qa: QA_LINK,
  discord: DISCORD_LINK,
} as const;

const navigationRoutes = { ...internalRoutes, ...externalRoutes };

export type NavigationRouteId = keyof typeof navigationRoutes;

export const getNavigationRouteInfo = (
  id: NavigationRouteId,
  timeZone: string,
  locale: string,
) => {
  let link =
    id === "event" ? navigationRoutes[id](timeZone) : navigationRoutes[id];

  // /schedule に関連するルートの場合は /locale を動的に追加
  if (link?.startsWith("/schedule")) {
    link = `/${locale}${link}`;
  }

  return {
    link: link ?? "",
    isExternalLink: id in externalRoutes,
  };
};
