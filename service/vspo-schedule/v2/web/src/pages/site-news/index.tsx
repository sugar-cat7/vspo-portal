import { siteNewsItems } from "@/data/content/site-news";
import { Breadcrumb } from "@/features/shared/components/Elements";
import { ContentLayout } from "@/features/shared/components/Layout/ContentLayout";
import { DEFAULT_LOCALE } from "@/lib/Const";
import { serverSideTranslations } from "@/lib/i18n/server";
import {
  formatDate,
  getInitializedI18nInstance,
  getSiteNewsTagColor,
} from "@/lib/utils";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
} from "@mui/material";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../_app";

type Props = {
  meta: {
    title: string;
    description: string;
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({
  locale = DEFAULT_LOCALE,
}) => {
  const translations = await serverSideTranslations(locale, [
    "common",
    "site-news",
  ]);
  const { t } = getInitializedI18nInstance(translations, "site-news");

  return {
    props: {
      ...translations,
      meta: {
        title: t("title"),
        description: t("description"),
      },
    },
  };
};

const SiteNewsPage: NextPageWithLayout<Props> = () => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LOCALE;
  const { t } = useTranslation("site-news");

  return (
    <>
      <Toolbar disableGutters variant="dense" sx={{ alignItems: "end" }}>
        <Breadcrumb />
      </Toolbar>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: "10px",
          boxShadow: "0px 3px 5px 2px rgba(0, 0, 0, 0.3)",
          borderRadius: "20px",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  //   color: "grey.900",
                  fontSize: "18px",
                  padding: "24px",
                }}
              >
                {t("tableHeaders.summary")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  //   color: "grey.900",
                  fontSize: "18px",
                  padding: "24px 4px",
                }}
              >
                {t("tableHeaders.updateDate")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  //   color: "grey.900",
                  fontSize: "18px",
                  padding: "24px",
                }}
              >
                {t("tableHeaders.tags")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {siteNewsItems.map((siteNewsItem) => (
              <TableRow key={siteNewsItem.id}>
                <TableCell sx={{ fontSize: "16px", padding: "24px" }}>
                  <Link href={`/site-news/${siteNewsItem.id}`} passHref>
                    <Box sx={{ textDecoration: "none", color: "inherit" }}>
                      {siteNewsItem.title}
                    </Box>
                  </Link>
                </TableCell>
                <TableCell
                  sx={{ fontSize: "16px", padding: "24px 4px", minWidth: 120 }}
                >
                  {formatDate(siteNewsItem.updated, "PPP", {
                    localeCode: locale,
                  })}
                </TableCell>
                <TableCell sx={{ fontSize: "16px", padding: "24px" }}>
                  {siteNewsItem.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={t(`tagLabels.${tag}`)}
                      variant="outlined"
                      color={getSiteNewsTagColor(tag)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

SiteNewsPage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title={pageProps.meta.title}
      description={pageProps.meta.description}
      path="/site-news"
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};

export default SiteNewsPage;
