import fs from "fs";
import path from "path";
import {
  CloudflareContext,
  getCloudflareContext,
} from "@opennextjs/cloudflare";
import { AppError, Err, Ok, Result } from "@vspo-lab/error";
import { remark } from "remark";
import html from "remark-html";

export type MarkdownContent = {
  content: string;
  data: Record<string, unknown>;
  html?: string;
};

/**
 * Check if running in Cloudflare Edge environment
 */
async function isCloudflareEdgeEnvironment(): Promise<boolean> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context?.env?.ASSETS !== undefined;
  } catch {
    return false;
  }
}

/**
 * Fetch markdown content from Cloudflare Assets
 */
async function fetchMarkdownFromAssets(
  locale: string,
  category: string,
  slug: string,
): Promise<Result<string>> {
  // Map "default" locale to "ja"
  const actualLocale = locale === "default" ? "ja" : locale;

  let context: CloudflareContext;
  try {
    context = await getCloudflareContext({ async: true });
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to get Cloudflare context",
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        context: {},
      }),
    );
  }

  const { env } = context;
  if (!env.ASSETS) {
    return Err(
      new AppError({
        message: "ASSETS binding not available",
        code: "INTERNAL_SERVER_ERROR",
        context: {},
      }),
    );
  }

  const assetPath = `/content/${actualLocale}/${category}/${slug}.md`;

  let response: Response;
  try {
    response = await env.ASSETS.fetch(`https://placeholder${assetPath}`);
  } catch (error) {
    return Err(
      new AppError({
        message: `Failed to fetch asset: ${assetPath}`,
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        context: {},
      }),
    );
  }

  if (!response.ok) {
    return Err(
      new AppError({
        message: `Asset not found: ${assetPath}`,
        code: "NOT_FOUND",
        context: {},
      }),
    );
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to read asset text",
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        context: {},
      }),
    );
  }

  return Ok(text);
}

/**
 * Content manifest type definition
 */
type ContentManifest = {
  locales: Record<string, Record<string, string[]>>;
};

/**
 * Fetch directory listing from Cloudflare Assets
 *
 * Uses the content-manifest.json file to get the list of available markdown files.
 */
async function fetchDirectoryFromAssets(
  locale: string,
  category: string,
): Promise<Result<string[]>> {
  // Map "default" locale to "ja"
  const actualLocale = locale === "default" ? "ja" : locale;

  let context: CloudflareContext;
  try {
    context = await getCloudflareContext({ async: true });
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to get Cloudflare context",
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        context: {},
      }),
    );
  }

  const { env } = context;
  if (!env.ASSETS) {
    return Err(
      new AppError({
        message: "ASSETS binding not available",
        code: "INTERNAL_SERVER_ERROR",
        context: {},
      }),
    );
  }

  // Fetch the content manifest file
  const manifestPath = `/content/content-manifest.json`;

  try {
    const manifestResponse = await env.ASSETS.fetch(
      `https://placeholder${manifestPath}`,
    );
    if (manifestResponse.ok) {
      const manifest = (await manifestResponse.json()) as ContentManifest;
      const files = manifest.locales[actualLocale]?.[category] || [];
      return Ok(
        files
          .filter((file) => file.endsWith(".md"))
          .map((file) => file.replace(/\.md$/, "")),
      );
    } else {
      return Err(
        new AppError({
          message: `Content manifest not found: ${manifestPath}`,
          code: "NOT_FOUND",
          context: { locale: actualLocale, category },
        }),
      );
    }
  } catch (error) {
    return Err(
      new AppError({
        message: "Failed to fetch content manifest",
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        context: { locale: actualLocale, category },
      }),
    );
  }
}

/**
 * Read markdown content from filesystem (for development)
 */
function readMarkdownFromFilesystem(
  locale: string,
  category: string,
  slug: string,
): string | null {
  // Map "default" locale to "ja"
  const actualLocale = locale === "default" ? "ja" : locale;

  const contentDirectory = path.join(process.cwd(), "public/content");
  const fullPath = path.join(
    contentDirectory,
    actualLocale,
    category,
    `${slug}.md`,
  );
  return fs.readFileSync(fullPath, "utf8");
}

/**
 * Read directory listing from filesystem (for development)
 *
 * Reads content-manifest.json from the content root directory.
 */
function readDirectoryFromFilesystem(
  locale: string,
  category: string,
): string[] {
  // Map "default" locale to "ja"
  const actualLocale = locale === "default" ? "ja" : locale;

  const contentDirectory = path.join(process.cwd(), "public/content");

  // Read content-manifest.json
  const manifestPath = path.join(contentDirectory, "content-manifest.json");
  try {
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, "utf8");
      const manifest = JSON.parse(manifestContent) as ContentManifest;
      const files = manifest.locales[actualLocale]?.[category] || [];
      return files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""));
    } else {
      console.error("Content manifest not found:", manifestPath);
      return [];
    }
  } catch (error) {
    console.error("Error reading content-manifest.json:", error);
    return [];
  }
}

/**
 * Parse frontmatter and content from markdown string
 */
function parseFrontmatter(fileContents: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContents.match(frontmatterRegex);

  if (!match) {
    return {
      data: {},
      content: fileContents,
    };
  }

  const frontmatterString = match[1];
  const content = match[2];

  // Parse YAML-like frontmatter
  const data: Record<string, unknown> = {};
  const lines = frontmatterString.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const colonIndex = trimmedLine.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).trim();
    let value = trimmedLine.substring(colonIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Handle arrays (simple format: [item1, item2])
    if (value.startsWith("[") && value.endsWith("]")) {
      const arrayContent = value.slice(1, -1);
      if (arrayContent.trim()) {
        data[key] = arrayContent
          .split(",")
          .map((item) => item.trim().replace(/^["']|["']$/g, ""));
      } else {
        data[key] = [];
      }
    }
    // Handle dates
    else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
      data[key] = new Date(value);
    }
    // Handle numbers
    else if (!isNaN(Number(value)) && value !== "") {
      data[key] = Number(value);
    }
    // Handle booleans
    else if (value === "true" || value === "false") {
      data[key] = value === "true";
    }
    // Handle strings
    else {
      data[key] = value;
    }
  }

  return {
    data,
    content,
  };
}

/**
 * Get markdown content (works in both Cloudflare and Node.js environments)
 */
export async function getMarkdownContent(
  locale: string,
  category: string,
  slug: string,
): Promise<MarkdownContent | null> {
  let fileContents: string | null = null;

  // Check if running in Cloudflare environment
  const isCloudflareEnv = await isCloudflareEdgeEnvironment();

  if (isCloudflareEnv) {
    // Use Cloudflare Assets API
    const result = await fetchMarkdownFromAssets(locale, category, slug);
    if (!result.err) {
      fileContents = result.val;
    } else {
      if (locale !== "ja") {
        // Fallback to Japanese if translation doesn't exist
        const fallbackResult = await fetchMarkdownFromAssets(
          "ja",
          category,
          slug,
        );
        if (!fallbackResult.err) {
          fileContents = fallbackResult.val;
        } else {
          console.error(
            "Failed to fetch Japanese fallback from Cloudflare Assets:",
            fallbackResult.err,
            fallbackResult.val,
          );
        }
      }
    }
  } else {
    // Use filesystem for development
    try {
      fileContents = readMarkdownFromFilesystem(locale, category, slug);
    } catch (error) {
      console.log("Failed to read from filesystem:", error);
      fileContents = null;
    }

    if (!fileContents && locale !== "ja") {
      // Fallback to Japanese if translation doesn't exist
      console.log("Trying Japanese fallback from filesystem");
      try {
        fileContents = readMarkdownFromFilesystem("ja", category, slug);
        console.log("Successfully read Japanese fallback from filesystem");
      } catch (error) {
        console.log("Failed to read Japanese fallback from filesystem:", error);
      }
    }
  }

  if (!fileContents) {
    return null;
  }

  const { data, content } = parseFrontmatter(fileContents);

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  const result = {
    content,
    data,
    html: contentHtml,
  };
  return result;
}

/**
 * Get markdown content synchronously (only works in Node.js environment)
 */
export function getMarkdownContentSync(
  locale: string,
  category: string,
  slug: string,
): MarkdownContent | null {
  const fileContents = readMarkdownFromFilesystem(locale, category, slug);
  if (!fileContents) {
    if (locale !== "ja") {
      // Fallback to Japanese if translation doesn't exist
      const fallbackContents = readMarkdownFromFilesystem("ja", category, slug);
      if (fallbackContents) {
        const { data, content } = parseFrontmatter(fallbackContents);
        return { content, data, html: undefined };
      }
    }
    return null;
  }

  const { data, content } = parseFrontmatter(fileContents);
  return { content, data, html: undefined };
}

/**
 * Get all markdown slugs for a category (works in both Cloudflare and Node.js environments)
 */
export async function getAllMarkdownSlugs(
  category: string,
  locale: string = "ja",
): Promise<string[]> {
  // Check if running in Cloudflare environment
  if (await isCloudflareEdgeEnvironment()) {
    // Use Cloudflare Assets API
    const result = await fetchDirectoryFromAssets(locale, category);
    if (!result.err) {
      return result.val;
    }
    console.error("Error fetching directory from assets:", result.err);
    return [];
  } else {
    // Use filesystem for development
    return readDirectoryFromFilesystem(locale, category);
  }
}

/**
 * Get all markdown slugs for a category (synchronous - only works in Node.js environment)
 */
export function getAllMarkdownSlugsSync(
  category: string,
  locale: string = "ja",
): string[] {
  return readDirectoryFromFilesystem(locale, category);
}

/**
 * Safely extract string value from unknown
 */
function extractString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Safely extract string array from unknown
 */
function extractStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

/**
 * Site news item type from markdown
 */
export type SiteNewsMarkdownItem = {
  id: number;
  title: string;
  content: string;
  html?: string | null;
  updated: string;
  tags: string[];
  tweetLink?: string | null;
};

/**
 * Get all site news items from markdown (works in both Cloudflare and Node.js environments)
 */
export async function getAllSiteNewsItems(
  locale: string,
): Promise<SiteNewsMarkdownItem[]> {
  const slugs = await getAllMarkdownSlugs("site-news", locale);

  const results = await Promise.all(
    slugs.map(async (slug): Promise<SiteNewsMarkdownItem | null> => {
      const markdownContent = await getMarkdownContent(
        locale,
        "site-news",
        slug,
      );
      if (!markdownContent) return null;

      const id = parseInt(slug, 10);
      if (isNaN(id)) return null;

      return {
        id,
        title: extractString(markdownContent.data.title),
        content: markdownContent.content,
        html: markdownContent.html || null,
        updated: markdownContent.data.updated
          ? markdownContent.data.updated instanceof Date
            ? markdownContent.data.updated.toISOString()
            : String(markdownContent.data.updated)
          : "",
        tags: extractStringArray(markdownContent.data.tags),
        tweetLink: extractString(markdownContent.data.tweetLink) || null,
      };
    }),
  );

  return results
    .filter((item): item is SiteNewsMarkdownItem => item !== null)
    .sort((a, b) => b.id - a.id); // Sort by ID descending
}

/**
 * Get all site news items from markdown (synchronous - only works in Node.js environment)
 */
export function getAllSiteNewsItemsSync(
  locale: string,
): SiteNewsMarkdownItem[] {
  const slugs = getAllMarkdownSlugsSync("site-news", locale);

  return slugs
    .flatMap((slug): SiteNewsMarkdownItem[] => {
      const markdownContent = getMarkdownContentSync(locale, "site-news", slug);
      if (!markdownContent) return [];

      const id = parseInt(slug, 10);
      if (isNaN(id)) return [];

      return [
        {
          id,
          title: extractString(markdownContent.data.title),
          content: markdownContent.content,
          html: markdownContent.html || null,
          updated: markdownContent.data.updated
            ? markdownContent.data.updated instanceof Date
              ? markdownContent.data.updated.toISOString()
              : String(markdownContent.data.updated)
            : "",
          tags: extractStringArray(markdownContent.data.tags),
          tweetLink: extractString(markdownContent.data.tweetLink) || null,
        },
      ];
    })
    .sort((a, b) => b.id - a.id); // Sort by ID descending
}

/**
 * Get a single site news item from markdown
 */
export async function getSiteNewsItem(
  locale: string,
  id: string,
): Promise<SiteNewsMarkdownItem | null> {
  const markdownContent = await getMarkdownContent(locale, "site-news", id);

  if (!markdownContent) {
    return null;
  }

  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return null;
  }

  const result = {
    id: numericId,
    title: extractString(markdownContent.data.title),
    content: markdownContent.content,
    html: markdownContent.html || null,
    updated: markdownContent.data.updated
      ? markdownContent.data.updated instanceof Date
        ? markdownContent.data.updated.toISOString()
        : String(markdownContent.data.updated)
      : "",
    tags: extractStringArray(markdownContent.data.tags),
    tweetLink: extractString(markdownContent.data.tweetLink) || null,
  };
  return result;
}
