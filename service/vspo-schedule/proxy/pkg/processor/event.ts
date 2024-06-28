import { EventsSchema } from "@/schema";
import { convertToUTC } from "../dayjs";
import { AppContext } from "../hono";
import { translateText } from "../translator";

export const eventProcessor = async (c: AppContext, data: any) => {
    const { kv } = c.get('services');
    const lang = c.req.query('lang') || 'ja';

    let parsedData;
    try {
        parsedData = EventsSchema.parse(data);
    } catch (error) {
        console.error('Failed to parse data:', error);
        throw new Error('Invalid event data');
    }

    parsedData.forEach((item: any) => {
        item.startedAt = convertToUTC(item.startedAt);
    });

    const translatedDataPromises = parsedData.map(async (item: any) => {
        const kvKey = `${item.newsId}_${lang}`;
        let kvData: string | null = await kv?.get(kvKey) ?? "{}"
        if (!kvData) {
            const translatedTitle = await translateText(c, item.title, lang);
            const translatedContentSummary = await translateText(c, item.contentSummary, lang);

            const kvObject = {
                title: translatedTitle,
                contentSummary: translatedContentSummary,
            };

            await kv.put(kvKey, JSON.stringify(kvObject));
            kvData = JSON.stringify(kvObject);
        }
        const parsedKvData = JSON.parse(kvData);
        return {
            ...item,
            ...parsedKvData
        };
    });

    const translatedData = await Promise.all(translatedDataPromises);
    return translatedData;
}
