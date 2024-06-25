import { App, AppContext } from './pkg/hono';
import { VideoSchema } from './schema';

export const registerProxyRoutes = (app: App) => {
    app.get('*', async (c: AppContext) => {
        // Get language from query parameter, default to 'ja' (Japanese)
        const lang = c.req.query('lang') || 'ja';
        const { kv } = c.get('services');

        // Send request to Backend API
        const response = await fetch(c.get('requestUrl'));

        // Parse response to JSON
        const data = await response.json();

        // Parse specific fields of the response using Zod schema
        const parsedData = VideoSchema.array().parse(data);

        // Process each item
        const translatedDataPromises = parsedData.map(async item => {
            const kvKey = `key_${item.id}_${lang}`;
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
const translateText = async (c: AppContext, text: string, lang: string): Promise<string> => {
    const { translator } = c.get('services');
    const request = {
        parent: c.get('gcpProjectPath'),
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: 'ja',
        targetLanguageCode: lang,
    };

    const [response] = await translator.translateText(request);

    return response.translations?.at(0)?.translatedText || '';
}
