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

CRITICAL VSPO MEMBER DETECTION RULES:
1. **ONLY USE PROVIDED KEYWORD LIST** - You can ONLY detect members whose names appear in the provided vspoKeywords list below
2. **DO NOT USE EXTERNAL KNOWLEDGE** - Do not use your general knowledge about VTubers or any other sources
3. **STRICT KEYWORD MATCHING** - Only match exact names or variations from the provided list
4. **EXCLUDE ALL OTHER VTUBERS** - Members from Nijisanji, Hololive, or any other VTuber groups are NOT vspo members
5. **Member Detection is MANDATORY** - A video can ONLY be classified as vspo clip if actual vspo members from the list are detected

IMPORTANT EXCLUSIONS - THESE ARE NOT VSPO MEMBERS:
- Any Nijisanji members (にじさんじ) - NOT vspo members
- Any Hololive members - NOT vspo members  
- Any other VTuber agency members - NOT vspo members
- Only members explicitly listed in the vspoKeywords below are valid

**OFFICIAL VSPO MEMBERS ONLY (from provided keyword list):**
${vspoKeywords.join(", ")}

**ABSOLUTE RULE: NO VSPO MEMBERS FROM LIST = NOT VSPO CLIP**
If ZERO members from the above list are detected in title/description/tags, then isVspoClip = false, regardless of any other indicators.

Check for the following criteria:
1. **Vspo member keywords (HIGHEST PRIORITY)** - Match ONLY these exact names or variations from the list above
2. **Content relevance** - Gaming, streaming, member activities related to vspo
3. **Optional: Permission number** - Look for "許諾番号" with numbers (not required for classification)

STRICT MATCHING RULES:
- **MUST HAVE DETECTED MEMBERS FROM LIST**: If no members from the provided keyword list are found → isVspoClip MUST be false
- **EXACT KEYWORD MATCHING**: Only names that appear in the vspoKeywords list can be added to detectedMembers
- **NO EXTERNAL MEMBER DETECTION**: Never detect members not in the provided list, even if they seem like VTubers
- **NIJISANJI EXCLUSION**: If "にじさんじ" is mentioned, this strongly indicates NON-vspo content
- **No Valid Members = Not Vspo**: Even with "ぶいすぽ" terms or permission numbers, if no valid members from the list are detected → isVspoClip = false

CONFIDENCE SCORING RULES:
- If detectedMembers is empty (no valid members from list found) → confidence should be VERY LOW (0.05-0.15) and isVspoClip = false
- If "にじさんじ" is mentioned and no vspo members detected → confidence should be EXTREMELY LOW (0.05) and isVspoClip = false
- If detectedMembers has 1+ valid members from list → confidence should be HIGH (0.8-0.95) and isVspoClip = true
- If only vspo-related terms but no valid members from list → confidence should be VERY LOW (0.05-0.2) and isVspoClip = false

Video Information to analyze:
Title: ${input.title}
Description: ${input.description || "No description provided"}
Tags: ${input.tags && input.tags.length > 0 ? input.tags.join(", ") : "No tags provided"}

Example with valid vspo clip (member from list detected):
Title: "【切り抜き】橘ひなの APEX配信ハイライト"
Description: "橘ひなの APEX配信 #橘ひなの #ぶいすぽっ"
Tags: ["橘ひなの", "APEX", "ぶいすぽっ", "切り抜き"]
Response: {
  "isVspoClip": true,
  "hasPermissionNumber": false,
  "detectedMembers": ["橘ひなの"],
  "permissionNumber": null,
  "confidence": 0.9
}

Example with Nijisanji member (NOT vspo clip):
Title: "【MADTOWN】にじさんじメンバー配信"
Description: "ぶいすぽ許諾番号: 20567 #にじさんじ #MADTOWN"
Tags: ["にじさんじ", "MADTOWN"]
Response: {
  "isVspoClip": false,
  "hasPermissionNumber": true,
  "detectedMembers": [],
  "permissionNumber": "20567",
  "confidence": 0.05
}

Example with permission number but NO valid members (NOT vspo clip):
Title: "【切り抜き】他のVTuber配信"
Description: "他のVTuberの配信切り抜き 許諾番号：12345"
Tags: ["切り抜き", "配信"]
Response: {
  "isVspoClip": false,
  "hasPermissionNumber": true,
  "detectedMembers": [],
  "permissionNumber": "12345",
  "confidence": 0.1
}

Example with vspo terms but NO valid members (NOT vspo clip):
Title: "【切り抜き】ぶいすぽ関連の話題"
Description: "ぶいすぽっ！について話している配信"
Tags: ["ぶいすぽ", "切り抜き"]
Response: {
  "isVspoClip": false,
  "hasPermissionNumber": false,
  "detectedMembers": [],
  "permissionNumber": null,
  "confidence": 0.1
}

**REMEMBER: If detectedMembers array is empty, isVspoClip MUST be false regardless of any other factors**

Return your response in this exact JSON format:
{
  "isVspoClip": boolean, // MUST be false if no valid members from provided list are detected
  "hasPermissionNumber": boolean,
  "detectedMembers": ["only members from the provided vspoKeywords list"], // MUST only contain names from the keyword list
  "permissionNumber": "string or null",
  "confidence": number // 0.0 to 1.0, very low when no valid members from list detected
}`;

export const generateReasonPrompt = ({
  isVspoClip,
  hasPermissionNumber,
  detectedMembers,
  permissionNumber,
  confidence,
}: {
  isVspoClip: boolean;
  hasPermissionNumber: boolean;
  detectedMembers: string[];
  permissionNumber: string | null;
  confidence: number;
}) => `Explain why this content is${isVspoClip ? "" : " not"} a valid vspo clip.

Analysis results:
- Permission number found: ${hasPermissionNumber ? "Yes" : "No"}
- Permission number: ${permissionNumber || "None"}
- Detected vspo members: ${detectedMembers.length > 0 ? detectedMembers.join(", ") : "None"}
- Confidence level: ${(confidence * 100).toFixed(1)}%

Return your response in this format:
{
  "reason": "This content is ${isVspoClip ? "a valid vspo clip" : "not a valid vspo clip"} because [detailed explanation]. Confidence is ${confidence < 0.5 ? "low" : confidence < 0.8 ? "moderate" : "high"} due to ${detectedMembers.length === 0 ? "no detected members" : `${detectedMembers.length} detected member(s)`} and ${hasPermissionNumber ? "presence" : "absence"} of permission number."
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
  "You are a VTuber streaming content categorization analyzer that matches video content to the most appropriate category with focus on games (specific titles), chatting, and other streaming content.";

export const generateCategoryMatchPrompt = ({
  input,
}: {
  input: CategoryInput;
}) => `Analyze this VTuber streaming content and determine the most appropriate category from the existing list, or suggest a new category if none fit well.

VTuber Content Classification Guidelines:
1. **Game Content** - Look for specific game titles, gaming keywords, gameplay mentions
2. **Chatting Content** - Look for conversation, talk, discussion, daily life topics
3. **Other Streaming Content** - Singing, drawing, cooking, ASMR, collaboration, special projects

Existing Categories:
${input.existingCategories.map((cat, index) => `${index + 1}. ${cat}`).join("\n")}

Popular Game Keywords to Watch For:
- APEX系: "APEX", "エーペックス", "エペ", "APEX Legends"
- Valorant系: "Valorant", "ヴァロラント", "バロラント", "VALO"
- Minecraft系: "Minecraft", "マインクラフト", "マイクラ"
- その他人気ゲーム: "フォートナイト", "デッバイ", "原神", "ポケモン", "スプラ", etc.

Chatting Keywords to Watch For:
- "雑談", "おしゃべり", "トーク", "話", "日常", "近況", "相談", "質問コーナー"

Video Information to analyze:
Title: ${input.title}
Description: ${input.description || "No description provided"}
Tags: ${input.tags && input.tags.length > 0 ? input.tags.join(", ") : "No tags provided"}

Analysis Guidelines:
1. **Game Detection Priority**: 
   - Search for specific game titles in title/description/tags
   - If found, match to the specific game category or suggest new game category
   - Extract the actual game title for gameTitle field
   
2. **Chatting Detection**:
   - Look for chatting keywords
   - Consider content without game mentions as potential chatting
   
3. **Confidence Scoring**:
   - High confidence (0.8-1.0): Clear game title or chatting keywords found
   - Medium confidence (0.5-0.7): Partial matches or contextual clues
   - Low confidence (0.1-0.4): Ambiguous content or no clear indicators

4. **New Category Suggestions**:
   - Suggest new game-specific categories for unrecognized games
   - Use format: "Game Title" (exact game name)
   - For non-game content, suggest descriptive categories

Example with specific game:
Title: "【APEX】ランク上げ頑張る！"
Description: "APEX Legendsでランクマッチに挑戦"
Tags: ["APEX", "ランク", "FPS"]
Existing Categories: ["雑談", "歌枠", "その他"]
Response: {
  "matchedCategory": null,
  "confidence": 0.9,
  "isNewCategory": true,
  "suggestedNewCategory": "APEX Legends",
  "gameTitle": "APEX Legends"
}

Example with chatting:
Title: "おはよう雑談！今日の予定話すよ～"
Description: "朝の雑談配信です"
Tags: ["雑談", "おしゃべり", "朝活"]
Existing Categories: ["APEX Legends", "雑談", "歌枠"]
Response: {
  "matchedCategory": "雑談",
  "confidence": 0.95,
  "isNewCategory": false,
  "suggestedNewCategory": null,
  "gameTitle": null
}

Example with existing game category match:
Title: "マイクラで建築しよう！"
Description: "Minecraftで街作り"
Tags: ["Minecraft", "建築", "マイクラ"]
Existing Categories: ["Minecraft", "雑談", "歌枠"]
Response: {
  "matchedCategory": "Minecraft",
  "confidence": 0.9,
  "isNewCategory": false,
  "suggestedNewCategory": null,
  "gameTitle": "Minecraft"
}

Return your response in this exact JSON format:
{
  "matchedCategory": "string or null",
  "confidence": number, // 0.0 to 1.0
  "isNewCategory": boolean,
  "suggestedNewCategory": "string or null",
  "gameTitle": "string or null" // Extract specific game title if detected
}`;

export const generateCategoryReasonPrompt = ({
  matchedCategory,
  confidence,
  isNewCategory,
  suggestedNewCategory,
  gameTitle,
}: {
  matchedCategory: string | null;
  confidence: number;
  isNewCategory: boolean;
  suggestedNewCategory: string | null;
  gameTitle: string | null;
}) => `Explain the category classification decision for this VTuber streaming content.

Classification results:
- Matched category: ${matchedCategory || "None"}
- Confidence level: ${(confidence * 100).toFixed(1)}%
- Is new category: ${isNewCategory ? "Yes" : "No"}
- Suggested new category: ${suggestedNewCategory || "None"}
- Detected game title: ${gameTitle || "None"}

Return your response in this format:
{
  "reason": "This VTuber streaming content ${isNewCategory ? `should be categorized as a new category '${suggestedNewCategory}'` : `matches the category '${matchedCategory}'`} because [detailed explanation]. ${gameTitle ? `Detected game: ${gameTitle}.` : ""} Confidence is ${confidence < 0.5 ? "low" : confidence < 0.8 ? "moderate" : "high"} due to [reasoning about confidence level]."
}`;
