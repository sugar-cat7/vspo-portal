import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { type TargetLang, TargetLangSchema } from "../../domain/translate";
import type { AIService } from "../../infra/ai/index";
import { vspoKeywordMap } from "../../infra/ai/keyword";

// Define schemas for different message types
export const DiscordMessageSchema = z.object({
  spoduleSettingCommand: z.object({
    label: z.string(),
    botAddButton: z.string(),
    botRemoveButton: z.string(),
    langSettingButton: z.string(),
    memberTypeSettingButton: z.string(),
  }),
  memberTypeSettingComponent: z.object({
    label: z.string(),
    selectSuccess: z.string(),
    selectError: z.string(),
  }),
  botAddComponent: z.object({
    error: z.string(),
  }),
  botRemoveComponent: z.object({
    label: z.string(),
    buttonStop: z.string(),
    buttonCancel: z.string(),
  }),
  yesBotRemoveComponent: z.object({
    error: z.string(),
    success: z.string(),
  }),
  cancelComponent: z.object({
    cancelled: z.string(),
  }),
  langSettingComponent: z.object({
    label: z.string(),
  }),
  langSelectComponent: z.object({
    error: z.string(),
    success: z.string(),
  }),
  announceCommand: z.object({
    sent: z.string(),
  }),
  bot: z.object({
    addSuccess: z.string(),
  }),
});

// Add more schemas here as needed
export const MessageSchemas = {
  discord: DiscordMessageSchema,
  // Add more schemas here as needed
} as const;

export type MessageType = keyof typeof MessageSchemas;
export type DiscordMessages = z.infer<typeof DiscordMessageSchema>;

interface TranslationOptions {
  sourceLang?: TargetLang;
  targetLang: TargetLang;
}

export async function translateMessages(
  aiService: AIService,
  messageType: MessageType,
  options: TranslationOptions,
): Promise<unknown> {
  const { sourceLang = "ja", targetLang } = options;
  const messages = DiscordMessageSchema.parse(
    JSON.parse(
      readFileSync(
        join(__dirname, `../public/locales/${sourceLang}/${messageType}.json`),
        "utf-8",
      ),
    ),
  );

  const translatedMessages: Record<string, any> = {};

  for (const [key, value] of Object.entries(messages)) {
    if (typeof value === "object") {
      translatedMessages[key] = {};
      for (const [subKey, subValue] of Object.entries(value)) {
        const response = await aiService.translateText(subValue, targetLang);

        if (response.err) {
          throw new Error(`Translation failed: ${response.err.message}`);
        }

        translatedMessages[key][subKey] = response.val.translatedText;
      }
    } else {
      const response = await aiService.translateText(value, targetLang);

      if (response.err) {
        throw new Error(`Translation failed: ${response.err.message}`);
      }

      translatedMessages[key] = response.val.translatedText;
    }
  }

  return MessageSchemas[messageType].parse(translatedMessages);
}
