import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError, Err, Ok, Result, wrap } from "@vspo-lab/error";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

export type MarkdownContent = {
  content: string;
  data: Record<string, any>;
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
  let context: any;
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

  const assetPath = `/content/${locale}/${category}/${slug}.md`;
  
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
 * Read markdown content from filesystem (for development)
 */
function readMarkdownFromFilesystem(
  locale: string,
  category: string,
  slug: string,
): string | null {
  try {
    const contentDirectory = path.join(process.cwd(), "public/content");
    const fullPath = path.join(contentDirectory, locale, category, `${slug}.md`);
    return fs.readFileSync(fullPath, "utf8");
  } catch (error) {
    return null;
  }
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
  if (await isCloudflareEdgeEnvironment()) {
    // Use Cloudflare Assets API
    const result = await fetchMarkdownFromAssets(locale, category, slug);
    if (!result.err) {
      fileContents = result.val;
    } else if (locale !== "ja") {
      // Fallback to Japanese if translation doesn't exist
      const fallbackResult = await fetchMarkdownFromAssets("ja", category, slug);
      if (!fallbackResult.err) {
        fileContents = fallbackResult.val;
      }
    }
  } else {
    // Use filesystem for development
    fileContents = readMarkdownFromFilesystem(locale, category, slug);
    if (!fileContents && locale !== "ja") {
      // Fallback to Japanese if translation doesn't exist
      fileContents = readMarkdownFromFilesystem("ja", category, slug);
    }
  }

  if (!fileContents) {
    return null;
  }

  const { data, content } = matter(fileContents);
  
  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();
  
  return {
    content,
    data,
    html: contentHtml,
  };
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
        const { data, content } = matter(fallbackContents);
        return { content, data, html: undefined };
      }
    }
    return null;
  }

  const { data, content } = matter(fileContents);
  return { content, data, html: undefined };
}

/**
 * Get all markdown slugs for a category
 */
export function getAllMarkdownSlugs(category: string): string[] {
  try {
    const contentDirectory = path.join(process.cwd(), "public/content");
    const categoryPath = path.join(contentDirectory, "ja", category);
    const files = fs.readdirSync(categoryPath);
    
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch (error) {
    return [];
  }
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
 * Get all site news items from markdown
 */
export function getAllSiteNewsItems(locale: string): SiteNewsMarkdownItem[] {
  const slugs = getAllMarkdownSlugs("site-news");
  
  return slugs
    .flatMap((slug): SiteNewsMarkdownItem[] => {
      const markdownContent = getMarkdownContentSync(locale, "site-news", slug);
      if (!markdownContent) return [];
      
      const id = parseInt(slug, 10);
      if (isNaN(id)) return [];
      
      return [{
        id,
        title: markdownContent.data.title || "",
        content: markdownContent.content,
        html: markdownContent.html || null,
        updated: markdownContent.data.updated 
          ? (markdownContent.data.updated instanceof Date 
             ? markdownContent.data.updated.toISOString() 
             : String(markdownContent.data.updated))
          : "",
        tags: markdownContent.data.tags || [],
        tweetLink: markdownContent.data.tweetLink || null,
      }];
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
  if (!markdownContent) return null;
  
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;
  
  return {
    id: numericId,
    title: markdownContent.data.title || "",
    content: markdownContent.content,
    html: markdownContent.html || null,
    updated: markdownContent.data.updated 
      ? (markdownContent.data.updated instanceof Date 
         ? markdownContent.data.updated.toISOString() 
         : String(markdownContent.data.updated))
      : "",
    tags: markdownContent.data.tags || [],
    tweetLink: markdownContent.data.tweetLink || null,
  };
}