import { createOpenAI, openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import {
  CategoryMatcherMetric,
  VspoClipCheckerMetric,
  YouTubeShortCheckerMetric,
} from "../evals/clip-checker";

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT,
});

const generateOpenAIModel = (model: string) => {
  return openaiProvider(model);
};

export const clipAgent = new Agent({
  name: "clip-agent",
  instructions:
    "You are a YouTube content analyzer specialized in identifying Vspo clips and YouTube Shorts. " +
    "You help analyze video content to determine if videos are official Vspo clips with proper permissions " +
    "or if they are YouTube Short format videos. You evaluate based on permission numbers, member keywords, " +
    "content relevance, video duration, tags, and other indicators.",
  model: generateOpenAIModel("gpt-4o-mini"),
  evals: {
    vspoClipChecker: new VspoClipCheckerMetric(
      generateOpenAIModel("gpt-4o-mini"),
    ),
    youTubeShortChecker: new YouTubeShortCheckerMetric(
      generateOpenAIModel("gpt-4o-mini"),
    ),
    categoryMatcher: new CategoryMatcherMetric(
      generateOpenAIModel("gpt-4o-mini"),
    ),
  },
});
