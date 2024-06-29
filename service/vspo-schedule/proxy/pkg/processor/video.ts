import { VideosSchema } from "@/schema";
import { convertToUTC } from "../dayjs";
import { AppContext } from "../hono";
import { translateText } from "../translator";

export const videoProcessor = async (c: AppContext, data: any) => {
    const { kv } = c.get('services');
    const lang = c.req.query('lang') || 'ja';
    // Livestream, freechat, clip.....
    // Parse specific fields of the response using Zod schema
    if (!Array.isArray(data)) {
        return []
    }
    const parsedData = VideosSchema.parse(data);
    // Date Format To UTC: scheduledStartTime, actualEndTime, createdAt
    parsedData?.forEach(item => {
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

    if (lang === 'ja' || c.req.path === '/api/clips/youtube') {
        return parsedData
    }
    // Process each item
    const translatedDataPromises = parsedData?.map(async item => {
        const kvKey = `${item.id}_${lang}`;
        let kvData: string | null = await kv?.get(kvKey)
        if (!kvData) {
            // Translate title and description
            const translatedTitle = await translateText(c, item.title, lang);
            const translatedDescription = await translateText(c, item.description, lang);

            // Prepare data to be saved in KV store
            const kvObject = {
                title: translatedTitle,
                description: translatedDescription,
            };

            // Save data to KV store
            await kv?.put(kvKey, JSON.stringify(kvObject));
            kvData = JSON.stringify(kvObject);
        }
        if (kvData) {
            // Convert data retrieved from KV store to object
            const parsedKvData = JSON.parse(kvData);

            // Construct return data by merging original and translated data
            return {
                ...item,
                ...parsedKvData
            };
        }
        // Construct return data by merging original and translated data
        return {
            ...item,
        };
    });

    const translatedData = await Promise.all(translatedDataPromises);
    return translatedData
}
