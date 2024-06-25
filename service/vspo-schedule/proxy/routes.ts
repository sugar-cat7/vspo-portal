import { App, AppContext } from './pkg/hono';
import { VideoSchema } from './schema';

export const registerProxyRoutes = (app: App) => {
    app.get('*', async (c: AppContext) => {
        // Get language from query parameter, default to 'ja' (Japanese)
        const lang = c.req.query('lang') || 'ja';
        const { kv } = c.get('services');
        // Send request to Backend API
        const response = await fetch(c.get('requestUrl'), { headers: c.req.raw.headers });

        if (lang === 'ja') {
            return response
        }
        // Parse response to JSON
        const data = await response.json();
        // Parse specific fields of the response using Zod schema
        const parsedData = VideoSchema.array().parse(data);

        // Process each item
        const translatedDataPromises = parsedData.map(async item => {
            const kvKey = `${item.id}_${lang}`;
            let kvData: string | null = await kv.get(kvKey);
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
                await kv.put(kvKey, JSON.stringify(kvObject));
                kvData = JSON.stringify(kvObject);
            }

            // Convert data retrieved from KV store to object
            const parsedKvData = JSON.parse(kvData);

            // Construct return data by merging original and translated data
            return {
                ...item,
                ...parsedKvData
            };
        });

        const translatedData = await Promise.all(translatedDataPromises);

        // Return the translated data
        return c.json(translatedData);
    });
}

// Function to translate text
const translateText = async (c: AppContext, text: string, targetLang: string): Promise<string> => {
    const requestBody = {
        q: text,
        source: 'ja',
        target: targetLang,
        format: 'text'
    };

    // Perform the fetch request to the Translation API
    const response = await fetch(c.get('translateUrl'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    // Parse the response and extract the translated text
    const responseData: { data: { translations: Array<{ detectedSourceLanguage: string, model: string, translatedText: string }> } } = await response.json()
    const translatedText = responseData?.data.translations?.at(0)?.translatedText || text;

    return translatedText;
};
