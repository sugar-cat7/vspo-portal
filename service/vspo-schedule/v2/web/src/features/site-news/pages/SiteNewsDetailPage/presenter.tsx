import { Breadcrumb, TweetEmbed } from "@/features/shared/components/Elements";
import { SiteNewsMarkdownItem } from "@/lib/markdown";
import { formatDate, getSiteNewsTagColor } from "@/lib/utils";
import { Box, Chip, Toolbar, Typography } from "@mui/material";
import { TFunction } from "next-i18next";
import * as React from "react";

type SiteNewsDetailPagePresenterProps = {
  siteNewsItem: SiteNewsMarkdownItem;
  locale: string;
  t: TFunction;
};

export const SiteNewsDetailPagePresenter: React.FC<
  SiteNewsDetailPagePresenterProps
> = ({ siteNewsItem, locale, t }) => {
  const formattedDate = formatDate(siteNewsItem.updated, "PPP", {
    localeCode: locale,
  });

  return (
    <>
      <Toolbar disableGutters variant="dense" sx={{ alignItems: "end" }}>
        <Breadcrumb />
      </Toolbar>

      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ marginTop: "10px" }}
        >
          {siteNewsItem.title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t("updateDate")}: {formattedDate}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {t("tags")}:
          {siteNewsItem.tags.map((tag) => (
            <Chip
              key={tag}
              label={t(`tagLabels.${tag}`)}
              variant="outlined"
              color={getSiteNewsTagColor(tag)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Typography>
        {siteNewsItem.html ? (
          <Box
            sx={{ marginBottom: "16px" }}
            dangerouslySetInnerHTML={{
              __html: siteNewsItem.html,
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ marginBottom: "16px" }}>
            {siteNewsItem.content}
          </Typography>
        )}
        {siteNewsItem.tweetLink && (
          <TweetEmbed tweetLink={siteNewsItem.tweetLink} />
        )}
      </Box>
    </>
  );
};
