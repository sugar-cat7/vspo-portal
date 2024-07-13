import { replaceKeywordsWithEnName } from "@/data/vspoinfo";
import { AppContext } from "../hono";

// Function to translate text
export const translateText = async (c: AppContext, text: string, targetLang: string, uniqueId: string): Promise<{
    id: string;
    translatedText: string;
}> => {
    const requestBody = {
        q: replaceKeywordsWithEnName(text),
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
    const translatedText = responseData?.data?.translations?.at(0)?.translatedText || text;
    const { kv } = c.get('services');
    await kv?.put(`${uniqueId}_${targetLang}`, JSON.stringify({
        title: translatedText,
    }));
    return {
        id: uniqueId,
        translatedText: translatedText
    };
};
