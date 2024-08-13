import { replaceKeywordsWithEnName } from "@/data/vspoinfo";
import { AppContext } from "../hono";
import OpenAI from "openai";
import { z } from "zod";
import { Env, zEnv } from "../env";
import { env } from "hono/adapter";

const languageNameMapping = {
    "en": "English",
    "ja": "Japanese",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "zh": "Chinese",
    "ko": "Korean",
};

const TargetLangSchema = z.enum(["en", "ja", "fr", "de", "es", "zh", "ko"]);

const openAIResponseSchema = z.object({
    content: z.string(),
});

export const translateText = async (c: AppContext, text: string, targetLang: string, uniqueId: string): Promise<{
    id: string;
    translatedText: string;
}> => {
    const { logger, kv } = c.get('services')
    const parseResult = TargetLangSchema.safeParse(targetLang);
    if (!parseResult.success) {
        logger.error('Invalid target language:', { targetLang });
        return {
            id: uniqueId,
            translatedText: text
        };
    }

    const targetLanguage = languageNameMapping[parseResult.data] || "English";

    const honoEnv = env<Env, AppContext>(c);
    const envResult = zEnv.safeParse(honoEnv);
    if (!envResult.success) {
        logger.error('Invalid environment:', { env: honoEnv });
        return {
            id: uniqueId,
            translatedText: text
        };
    }

    const d = await kv?.get(`${uniqueId}_${targetLang}`)
    if (d) {
        const parsedData = JSON.parse(d);
        return {
            id: uniqueId,
            translatedText: parsedData.title
        };
    }

    const openai = new OpenAI({
        organization: envResult.data?.OPENAI_ORGANIZATION,
        project: envResult.data?.OPENAI_PROJECT,
        apiKey: envResult.data?.OPENAI_API_KEY,
        baseURL: envResult.data?.OPENAI_BASE_URL
    });

    const systemPrompt = `Please translate the following user message into ${targetLanguage}. Return the translation in a JSON object with the key "content".`;

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: replaceKeywordsWithEnName(text) }
        ],
        max_tokens: 3000,
        response_format: { type: "json_object" },
    });

    const response = chatCompletion.choices[0].message;
    const r = openAIResponseSchema.safeParse(response);
    if (!r.success) {
        logger.error('Invalid OpenAI response:', { response });
        return {
            id: uniqueId,
            translatedText: text
        };
    }

    await kv?.put(`${uniqueId}_${targetLang}`, JSON.stringify({
        title: r.data.content,
    }));

    return {
        id: uniqueId,
        translatedText: r.data.content
    };
};
