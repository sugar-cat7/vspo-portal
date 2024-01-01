export type VspoEvent = {
  startedAt: string;
  title: string;
  contentSummary: string;
  webPageLinks: string[];
  tweetLinks: string[];
  isNotLink?: boolean;
  newsId: string;
};
