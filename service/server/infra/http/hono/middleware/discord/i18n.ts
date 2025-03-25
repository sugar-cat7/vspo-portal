import { OpenFeature } from "@openfeature/server-sdk";
import { createMiddleware } from "hono/factory";
import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { AppLogger } from "../../../../../pkg/logging";
import type { HonoEnv } from "../../env";

export const i18nMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  AppLogger.info("i18nMiddleware");
  const locales = await c.env.ASSETS.fetch("https://assets.local/locales/en/discord.json");
  AppLogger.info("locales", locales);
  i18next
    // .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`, { assert: { type: 'json' } })))
    .init({
      lng: "en",
      fallbackLng: "en",
      ns: ["translation"],
      defaultNS: "translation",
      interpolation: { escapeValue: false },
    });
  await next();
});
