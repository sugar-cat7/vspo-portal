import OpenAI from "openai";
import { z } from "zod";
import { TargetLangSchema } from "../../domain/translate";
import {
  AppError,
  Err,
  ErrorCodeSchema,
  Ok,
  type Result,
  wrap,
} from "../../pkg/errors";
import { withTracerResult } from "../http/trace/cloudflare";
import { vspoKeywordMap } from "./keyword";

const languageCodeMapping: Record<string, string> = {
  en: "English",
  ja: "Japanese",
  fr: "French",
  de: "German",
  es: "Spanish",
  cn: "Chinese (Simplified)",
  tw: "Chinese (Traditional)",
  ko: "Korean",
};

const openAIResponseSchema = z.object({
  content: z.string(),
});

export interface IAIService {
  translateText(
    text: string,
    targetLang: string,
    prompt?: string,
  ): Promise<Result<{ translatedText: string }, AppError>>;
}

export class AIService implements IAIService {
  private openai: OpenAI;

  constructor({
    apiKey,
    organization,
    project,
    baseURL,
  }: {
    apiKey: string;
    organization: string;
    project: string;
    baseURL: string;
  }) {
    this.openai = new OpenAI({
      apiKey,
      organization,
      project,
      baseURL,
    });
  }

  async translateText(
    text: string,
    targetLang: string,
    prompt?: string,
  ): Promise<Result<{ translatedText: string }, AppError>> {
    return withTracerResult("ai", "translateText", async (span) => {
      const parseResult = TargetLangSchema.safeParse(targetLang);
      if (!parseResult.success) {
        return Err(
          new AppError({
            message: "Invalid target language",
            code: "BAD_REQUEST",
          }),
        );
      }

      if (parseResult.data === "default" || !text) {
        return Ok({ translatedText: text });
      }
      const targetLanguage = languageCodeMapping[parseResult.data] || "English";

      const keywordMapString = JSON.stringify(vspoKeywordMap, null, 2);
      const systemPrompt = `Please translate the following user message into ${targetLanguage}. Ensure consistency in name translations according to the following mapping: ${keywordMapString}. Return the translation in a JSON object with the key \"content\".`;
      const responseResult = await wrap(
        this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            prompt
              ? { role: "system", content: prompt }
              : { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
        (err) =>
          new AppError({
            message: `OpenAI API error: ${err.message}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
          }),
      );

      if (responseResult.err) {
        return Err(responseResult.err);
      }

      const response = responseResult.val.choices[0].message?.content;
      if (!response) {
        return Err(
          new AppError({
            message: "Empty AI response",
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
          }),
        );
      }

      const parsedResponse = openAIResponseSchema.safeParse(
        JSON.parse(response),
      );
      if (!parsedResponse.success) {
        return Err(
          new AppError({
            message: "Invalid OpenAI response format",
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
          }),
        );
      }

      return Ok({ translatedText: parsedResponse.data.content });
    });
  }
}
