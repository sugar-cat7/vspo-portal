export type SiteNewsItem = {
  id: number;
  title: string;
  content: string;
  updated: string;
  tags: SiteNewsTag[];
  tweetLink?: string;
};

export type SiteNewsTag = "feat" | "fix";
