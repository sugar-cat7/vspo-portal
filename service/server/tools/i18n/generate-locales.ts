import fs from "fs";
import path from "path";
import type { TargetLang } from "../../domain/translate";
import { createAIService } from "../../infra/ai";
import { type MessageType, translateMessages } from "./schema";

const targetLanguages: TargetLang[] = [
  "en",
  "fr",
  "de",
  "es",
  "cn",
  "tw",
  "ko",
  "ja"
];

async function generateLocales() {
  const aiService = createAIService({
    apiKey: process.env.OPENAI_API_KEY || "",
    organization: process.env.OPENAI_ORG_ID || "",
    project: process.env.OPENAI_PROJECT_ID || "",
    baseURL: process.env.OPENAI_BASE_URL || "",
  });

  const localesDir = path.join(
    __dirname,
    `../public/${process.env.TRANSLATION_TARGET_PATH}`,
  );

  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  for (const lang of targetLanguages) {
    console.log(`Generating locale for ${lang}...`);

    try {
      const translatedMessages = await translateMessages(
        aiService,
        process.env.MESSAGE_TYPE as MessageType,
        { targetLang: lang },
      );

      const langDir = path.join(localesDir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      const filePath = path.join(langDir, "discord.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify(translatedMessages, null, 2),
        "utf-8",
      );

      console.log(`Successfully generated locale for ${lang}`);
    } catch (error) {
      console.error(`Failed to generate locale for ${lang}:`, error);
    }
  }
}

generateLocales().catch(console.error);
