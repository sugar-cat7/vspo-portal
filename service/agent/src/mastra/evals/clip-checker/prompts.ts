export interface VideoInput {
  title: string;
  description?: string;
  tags?: string[];
  duration?: number; // Duration in seconds for Short detection
}

export interface CategoryInput {
  title: string;
  description?: string;
  tags?: string[];
  existingCategories: string[];
}

export const CLIP_INSTRUCTIONS =
  "You are a YouTube content analyzer that identifies if clip videos are official vspo clips.";

export const generateVspoClipPrompt = ({
  input,
  vspoKeywords,
}: {
  input: VideoInput;
  vspoKeywords: string[];
}) => `Analyze if this YouTube clip video is an official vspo clip.

Check for the following criteria:
1. Permission number (許諾番号) - Look for patterns like:
   - "ぶいすぽっ！許諾番号：" followed by numbers
   - "許諾番号" with any numbers
   - "Vspo! License Number" with numbers
   
2. Vspo member keywords - Match any of these exact names or variations:
   ${vspoKeywords.join(", ")}
   
3. Vspo-related terms - Look for:
   - "ぶいすぽ" or "ぶいすぽっ" 
   - "切り抜き" (clip)
   - Member names in title, description, or tags
   
4. Content relevance - Gaming, streaming, member activities related to vspo

IMPORTANT MATCHING RULES:
- If you find "ぶいすぽ" anywhere in title, description, or tags → isVspoClip should be true
- If you find any member name from the keywords list → add to detectedMembers and set isVspoClip to true
- If you find "許諾番号" with numbers → hasPermissionNumber should be true
- Extract the actual permission number (e.g., "09522" from "ぶいすぽっ！許諾番号：09522")

Video Information to analyze:
Title: ${input.title}
Description: ${input.description || "No description provided"}
Tags: ${input.tags && input.tags.length > 0 ? input.tags.join(", ") : "No tags provided"}

Example with valid vspo clip:
Title: "【切り抜き】橘ひなの APEX配信ハイライト"
Description: "橘ひなの APEX配信 許諾番号:VSP2024-001 #橘ひなの #ぶいすぽっ"
Tags: ["橘ひなの", "APEX", "ぶいすぽっ", "切り抜き"]
Response: {
  "isVspoClip": true,
  "hasPermissionNumber": true,
  "detectedMembers": ["橘ひなの"],
  "permissionNumber": "VSP2024-001"
}

Example non-vspo clip:
Title: "【切り抜き】他のVTuber ゲーム実況"
Description: "他のVTuberのゲーム実況ハイライト"
Tags: ["ゲーム", "実況", "切り抜き"]
Response: {
  "isVspoClip": false,
  "hasPermissionNumber": false,
  "detectedMembers": [],
  "permissionNumber": null
}

Return your response in this exact JSON format:
{
  "isVspoClip": boolean,
  "hasPermissionNumber": boolean,
  "detectedMembers": ["list of detected vspo member names"],
  "permissionNumber": "string or null"
}`;

export const generateReasonPrompt = ({
  isVspoClip,
  hasPermissionNumber,
  detectedMembers,
  permissionNumber,
}: {
  isVspoClip: boolean;
  hasPermissionNumber: boolean;
  detectedMembers: string[];
  permissionNumber: string | null;
}) => `Explain why this content is${isVspoClip ? "" : " not"} a valid vspo clip.

Analysis results:
- Permission number found: ${hasPermissionNumber ? "Yes" : "No"}
- Permission number: ${permissionNumber || "None"}
- Detected vspo members: ${detectedMembers.length > 0 ? detectedMembers.join(", ") : "None"}

Return your response in this format:
{
  "reason": "This content is ${isVspoClip ? "a valid vspo clip" : "not a valid vspo clip"} because [detailed explanation]"
}`;

export const SHORT_INSTRUCTIONS =
  "You are a YouTube content analyzer that identifies if videos are YouTube Shorts.";

export const generateShortCheckPrompt = ({
  input,
}: {
  input: VideoInput;
}) => `Analyze if this YouTube video is a YouTube Short.

Check for:
- Duration: YouTube Shorts are typically 60 seconds or less
- Short-related tags: #short, #shorts, #youtubeshorts, etc.
- Title indicators: Keywords like "Short", "ショート", etc.
- Description content: Mentions of short-form content

Video Information to analyze:
Title: ${input.title}
Description: ${input.description || "No description provided"}
Tags: ${input.tags && input.tags.length > 0 ? input.tags.join(", ") : "No tags provided"}
Duration: ${input.duration ? `${input.duration} seconds` : "Duration not provided"}

Guidelines:
- Videos ≤ 60 seconds are likely Shorts
- Presence of #short, #shorts tags strongly indicates Short
- Title/description mentioning "Short" or "ショート" suggests Short format
- Consider all factors together for final decision

Example YouTube Short:
Title: "面白いゲームシーン #shorts"
Description: "短い動画でお楽しみください！ #short #youtubeshorts"
Tags: ["shorts", "short", "面白い", "ゲーム"]
Duration: 45 seconds
Response: {
  "isYouTubeShort": true,
  "hasShortTags": true,
  "durationIndicatesShort": true,
  "titleIndicatesShort": true,
  "confidence": 0.95
}

Example regular video:
Title: "完全攻略ガイド - 長編解説"
Description: "詳細な解説動画です"
Tags: ["攻略", "解説", "ガイド"]
Duration: 600 seconds
Response: {
  "isYouTubeShort": false,
  "hasShortTags": false,
  "durationIndicatesShort": false,
  "titleIndicatesShort": false,
  "confidence": 0.9
}

Return your response in this format:
{
  "isYouTubeShort": boolean,
  "hasShortTags": boolean,
  "durationIndicatesShort": boolean,
  "titleIndicatesShort": boolean,
  "confidence": number // 0.0 to 1.0
}`;

export const generateShortReasonPrompt = ({
  isYouTubeShort,
  hasShortTags,
  durationIndicatesShort,
  titleIndicatesShort,
  confidence,
}: {
  isYouTubeShort: boolean;
  hasShortTags: boolean;
  durationIndicatesShort: boolean;
  titleIndicatesShort: boolean;
  confidence: number;
}) => `Explain why this video is${isYouTubeShort ? "" : " not"} a YouTube Short.

Analysis results:
- Has Short tags: ${hasShortTags ? "Yes" : "No"}
- Duration indicates Short: ${durationIndicatesShort ? "Yes" : "No"}
- Title indicates Short: ${titleIndicatesShort ? "Yes" : "No"}
- Confidence level: ${(confidence * 100).toFixed(1)}%

Return your response in this format:
{
  "reason": "This video is ${isYouTubeShort ? "a YouTube Short" : "not a YouTube Short"} because [detailed explanation based on the analysis factors]"
}`;

export const CATEGORY_INSTRUCTIONS =
  "You are a content categorization analyzer that matches video content to the most appropriate category or suggests new categories.";

export const generateCategoryMatchPrompt = ({
  input,
}: {
  input: CategoryInput;
}) => `Analyze this video content and determine the most appropriate category from the existing list, or suggest a new category if none fit well.

Existing Categories:
${input.existingCategories.map((cat, index) => `${index + 1}. ${cat}`).join("\n")}

Video Information to analyze:
Title: ${input.title}
Description: ${input.description || "No description provided"}
Tags: ${input.tags && input.tags.length > 0 ? input.tags.join(", ") : "No tags provided"}

Analysis Guidelines:
1. Look for keywords and themes in title, description, and tags
2. Consider the content type and subject matter
3. Match against existing categories based on semantic similarity
4. If no existing category fits well (confidence < 0.7), suggest a new category
5. New category names should be concise, descriptive, and general enough for future content

Example with existing category match:
Title: "APEX配信ハイライト"
Description: "今日のAPEX Legendsの面白いシーンをまとめました"
Tags: ["APEX", "FPS", "ゲーム", "配信"]
Existing Categories: ["FPS Games", "RPG Games", "Music", "Cooking"]
Response: {
  "matchedCategory": "FPS Games",
  "confidence": 0.95,
  "isNewCategory": false,
  "suggestedNewCategory": null
}

Example with new category suggestion:
Title: "手料理レシピ解説"
Description: "簡単にできる料理のレシピを説明します"
Tags: ["料理", "レシピ", "解説"]
Existing Categories: ["Gaming", "Music", "Technology"]
Response: {
  "matchedCategory": null,
  "confidence": 0.3,
  "isNewCategory": true,
  "suggestedNewCategory": "Cooking & Recipes"
}

Return your response in this exact JSON format:
{
  "matchedCategory": "string or null",
  "confidence": number, // 0.0 to 1.0
  "isNewCategory": boolean,
  "suggestedNewCategory": "string or null"
}`;

export const generateCategoryReasonPrompt = ({
  matchedCategory,
  confidence,
  isNewCategory,
  suggestedNewCategory,
}: {
  matchedCategory: string | null;
  confidence: number;
  isNewCategory: boolean;
  suggestedNewCategory: string | null;
}) => `Explain the category classification decision for this video content.

Classification results:
- Matched category: ${matchedCategory || "None"}
- Confidence level: ${(confidence * 100).toFixed(1)}%
- Is new category: ${isNewCategory ? "Yes" : "No"}
- Suggested new category: ${suggestedNewCategory || "None"}

Return your response in this format:
{
  "reason": "This content ${isNewCategory ? `should be categorized as a new category '${suggestedNewCategory}'` : `matches the category '${matchedCategory}'`} because [detailed explanation of the analysis and reasoning]"
}`;
