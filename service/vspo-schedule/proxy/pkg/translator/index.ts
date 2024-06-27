import { AppContext } from "../hono";

// Function to translate text
export const translateText = async (c: AppContext, text: string, targetLang: string): Promise<string> => {
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
