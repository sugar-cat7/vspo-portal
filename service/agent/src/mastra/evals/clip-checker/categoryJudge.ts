import type { LanguageModel } from "@mastra/core/llm";
import { MastraAgentJudge } from "@mastra/evals/judge";
import { z } from "zod";
import type { CategoryInput } from "./prompts";
import {
  generateCategoryMatchPrompt,
  generateCategoryReasonPrompt,
} from "./prompts";
import { CATEGORY_INSTRUCTIONS } from "./prompts";

export class CategoryMatcherJudge extends MastraAgentJudge {
  constructor(model: LanguageModel) {
    super("Category Matcher", CATEGORY_INSTRUCTIONS, model);
  }

  async evaluate(input: CategoryInput): Promise<{
    matchedCategory: string | null;
    confidence: number;
    isNewCategory: boolean;
    suggestedNewCategory: string | null;
  }> {
    const categoryPrompt = generateCategoryMatchPrompt({ input });

    // Debug logging
    console.log("=== DEBUG CategoryMatcherJudge ===");
    console.log("Input:", JSON.stringify(input, null, 2));
    console.log("Existing Categories:", input.existingCategories);
    console.log(`Prompt: ${categoryPrompt.substring(0, 500)}...`);
    console.log("==================================");

    const result = await this.agent.generate(categoryPrompt, {
      output: z.object({
        matchedCategory: z.string().nullable(),
        confidence: z.number().min(0).max(1),
        isNewCategory: z.boolean(),
        suggestedNewCategory: z.string().nullable(),
      }),
    });

    console.log("CategoryMatcherJudge result:", result.object);

    return result.object;
  }

  async getReason(args: {
    matchedCategory: string | null;
    confidence: number;
    isNewCategory: boolean;
    suggestedNewCategory: string | null;
  }): Promise<string> {
    const prompt = generateCategoryReasonPrompt(args);
    const result = await this.agent.generate(prompt, {
      output: z.object({
        reason: z.string(),
      }),
    });

    return result.object.reason;
  }

  getDefaultCategories(): string[] {
    return [
      "Gaming",
      "Music",
      "Technology",
      "Education",
      "Entertainment",
      "Sports",
      "News",
      "Comedy",
      "DIY & Crafts",
      "Food & Cooking",
      "Travel",
      "Lifestyle",
      "Science",
      "Art & Design",
      "Business",
    ];
  }
}
