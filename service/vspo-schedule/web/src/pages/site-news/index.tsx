import { siteNewsItems } from "@/data/content/site-news";
import { NextPageWithLayout } from "../_app";
import { ContentLayout } from "@/components/Layout/ContentLayout";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Toolbar,
} from "@mui/material";
import Link from "next/link";
import { getColor } from "@/lib/utils";
import { Breadcrumb } from "@/components/Elements";

const SiteNewsPage: NextPageWithLayout = () => {
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
                内容
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  //   color: "grey.900",
                  fontSize: "18px",
                  padding: "24px 4px",
                }}
              >
                更新日
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  //   color: "grey.900",
                  fontSize: "18px",
                  padding: "24px",
                }}
              >
                Tags
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {siteNewsItems.map((siteNewsItem) => (
              <TableRow key={siteNewsItem.id}>
                <TableCell sx={{ fontSize: "16px", padding: "24px" }}>
                  <Link href={`/site-news/${siteNewsItem.id}`} passHref>
                    <Box sx={{ textDecoration: "none", color: "inherit" }}>
                      {siteNewsItem.content}
                    </Box>
                  </Link>
                </TableCell>
                <TableCell
                  sx={{ fontSize: "16px", padding: "24px 4px", minWidth: 120 }}
                >
                  {siteNewsItem.updated}
                </TableCell>
                <TableCell sx={{ fontSize: "16px", padding: "24px" }}>
                  {siteNewsItem.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                      color={getColor(tag)}
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

SiteNewsPage.getLayout = (page) => {
  return (
    <ContentLayout
      title="すぽじゅーるからのお知らせ"
      description="バグ改善や新機能追加に関してのお知らせを表示します。"
      path="/site-news"
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};

export default SiteNewsPage;
