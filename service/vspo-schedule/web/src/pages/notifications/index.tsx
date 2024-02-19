import { notifications } from "@/data/notifications";
import { NextPageWithLayout } from "../_app";
import { ContentLayout } from "@/components/Layout/ContentLayout";
import { Notice } from "@/types/notice";
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
  Container,
} from "@mui/material";
import Link from "next/link";
import { getColor } from "@/lib/utils";
import { Breadcrumb } from "@/components/Elements";

const Notifications: NextPageWithLayout = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        marginTop: 2,
      }}
    >
      <Breadcrumb />
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
            {notifications.map((notice: Notice) => (
              <TableRow key={notice.id}>
                <TableCell sx={{ fontSize: "16px", padding: "24px" }}>
                  <Link href={`/notifications/${notice.id}`} passHref>
                    <Box sx={{ textDecoration: "none", color: "inherit" }}>
                      {notice.content}
                    </Box>
                  </Link>
                </TableCell>
                <TableCell
                  sx={{ fontSize: "16px", padding: "24px 4px", minWidth: 120 }}
                >
                  {notice.updated}
                </TableCell>
                <TableCell sx={{ fontSize: "16px", padding: "24px" }}>
                  {notice.tags.map((tag) => (
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
    </Container>
  );
};

Notifications.getLayout = (page) => {
  return (
    <ContentLayout
      title="すぽじゅーるからのお知らせ"
      description="バグ改善や新機能追加に関してのお知らせを表示します。"
      path="/notifications"
    >
      {page}
    </ContentLayout>
  );
};

export default Notifications;
