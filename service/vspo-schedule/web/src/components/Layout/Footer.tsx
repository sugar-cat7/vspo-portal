import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

type Props = {
  lastUpdateDate?: string;
  description?: string;
};
export const Footer: React.FC<Props> = ({ lastUpdateDate, description }) => {
  return (
    <Box mt={4} mb={2} textAlign="center">
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {lastUpdateDate && (
        <Typography variant="body2" color="text.secondary">
          最終更新日時:{lastUpdateDate}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" mt={1}>
        <Link href={"/schedule/all"}>ホーム</Link> /{" "}
        <Link href={"/terms"}>利用規約</Link> /{" "}
        <Link href={"/privacy-policy"}>プライバシーポリシー</Link>
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        &copy; すぽじゅーる {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};
