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
  notification: "/notifications",
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

export const bottomNavigationContents = [
  { id: "list", name: "配信一覧" },
  { id: "clip", name: "切り抜き" },
  { id: "twitch-clip", name: "クリップ" },
  { id: "event", name: "イベント" },
] as const satisfies { id: NavigationRouteId, name: string }[];

export const drawerContents = [
  { id: "live", name: "配信中" },
  { id: "upcoming", name: "配信予定" },
  { id: "archive", name: "アーカイブ" },
  { id: "freechat", name: "フリーチャット" },
  { id: "clip", name: "切り抜き一覧" },
  { id: "twitch-clip", name: "クリップ一覧" },
  { id: "about", name: "すぽじゅーるについて" },
  { id: "notification", name: "お知らせ" },
  { id: "qa", name: "お問い合わせ" },
  { id: "discord", name: "Discord Bot" },
] as const satisfies { id: NavigationRouteId, name: string }[];
