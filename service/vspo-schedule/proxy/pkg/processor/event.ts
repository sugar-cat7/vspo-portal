import { convertToUTC } from "../dayjs";
import { AppContext } from "../hono";
import { translateText } from "../translator";

export const eventProcessor = async (c: AppContext, data: any) => {
    const { kv } = c.get('services');
    const lang = c.req.query('lang') || 'ja';
    if (!Array.isArray(data)) {
        return data
    }
    const parsedData = data;
    parsedData.forEach((item: any) => {
        item.startedAt = convertToUTC(item.startedAt);
    });

    if (lang === 'ja') {
        return parsedData;
    }

    const translatedDataPromises = parsedData.map(async (item: any) => {
        const kvKey = `${item.newsId}_${lang}`;
        let kvData: string | null = await kv?.get(kvKey);
        if (!kvData) {
            const translatedTitle = await translateText(c, item.title, lang);
            const translatedContentSummary = await translateText(c, item.contentSummary, lang);

            const kvObject = {
                title: translatedTitle,
                contentSummary: translatedContentSummary,
            };

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
        return {
            ...item,
        };
    });

    const translatedData = await Promise.all(translatedDataPromises);
    return translatedData;
}
