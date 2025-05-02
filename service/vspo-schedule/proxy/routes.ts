import { createCache, getCache } from "./pkg/cache";
import { App, AppContext } from "./pkg/hono";
import { eventProcessor, videoProcessor } from "./pkg/processor";
import { translateText } from "./pkg/translator";

export const registerOldAPIProxyRoutes = (app: App) => {
  app.get("*", async (c: AppContext) => {
    const { kv } = c.get("services");
    const requestUrl = c.get("requestUrl");
    const { cache, isExpired } = await getCache(kv, requestUrl);

    if (cache && !isExpired) {
      const data = JSON.parse(cache);
      return c.json(data);
    }

    const response = await fetch(requestUrl, {
      method: c.req.method,
      headers: c.req.header(),
    });
    const data = await response.json();

    let translatedData;
    if (c.req.path.includes("events")) {
      translatedData = await eventProcessor(c, data);
    } else {
      translatedData = await videoProcessor(c, data);
      c.executionCtx.waitUntil(
        Promise.all(
          translatedData
            .filter((item) => !item.isTitleTranslated)
            .map((item) =>
              translateText(
                c,
                item.title,
                c.req.query("lang") || "ja",
                item.id,
              ),
            ),
        ),
      );
    }

    // Cache the translated data if it is expired or not found
    if (isExpired || !cache) {
      if (translatedData?.length > 0) {
        c.executionCtx.waitUntil(
          createCache(kv, requestUrl, JSON.stringify(translatedData), 60),
        );
      }
    }

    return c.json(translatedData);
  });
};
