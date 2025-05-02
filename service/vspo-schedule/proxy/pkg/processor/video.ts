import { VideosSchema } from "@/schema";
import { convertToUTC } from "../dayjs";
import { AppContext } from "../hono";

export const videoProcessor = async (c: AppContext, data: any) => {
  const { kv } = c.get("services");
  const lang = c.req.query("lang") || "ja";
  // Livestream, freechat, clip.....
  // Parse specific fields of the response using Zod schema
  if (!Array.isArray(data)) {
    return [];
  }
  const parsedData = VideosSchema.parse(data);
  // Date Format To UTC: scheduledStartTime, actualEndTime, createdAt
  parsedData?.forEach((item) => {
    if (item.scheduledStartTime) {
      item.scheduledStartTime = convertToUTC(item.scheduledStartTime);
    }
    if (item.actualEndTime) {
      item.actualEndTime = convertToUTC(item.actualEndTime);
    }
    if (item.createdAt) {
      item.createdAt = convertToUTC(item.createdAt);
    }
  });

  if (lang === "ja" || c.req.path === "/api/clips/youtube") {
    return parsedData;
  }
  // Process each item
  const translatedData = await Promise.all(
    parsedData.map(async (item) => {
      const kvKey = `${item.id}_${lang}`;
      const kvData = await kv?.get(kvKey);

      if (kvData) {
        const parsedKvData = JSON.parse(kvData);
        return {
          ...item,
          ...parsedKvData,
          isTitleTranslated: true,
        };
      }

      return {
        ...item,
        isTitleTranslated: false,
      };
    }),
  );
  return translatedData;
};
