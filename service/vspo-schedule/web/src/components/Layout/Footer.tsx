import React from "react";
import { Box, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import { useTranslation } from "next-i18next";
import { getCurrentUTCDate } from "@/lib/dayjs";
import { formatDate } from "@/lib/utils";
import { useTimeZoneContext } from "@/hooks";

type Props = {
  lastUpdateTimestamp?: number;
  description?: string;
};
export const Footer: React.FC<Props> = ({
  lastUpdateTimestamp,
  description,
}) => {
  const { t } = useTranslation("common");
  const { timeZone } = useTimeZoneContext();
  return (
    <Box mt={4} mb={2} textAlign="center">
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {lastUpdateTimestamp && (
        <Typography variant="body2" color="text.secondary">
          {t("footer.lastUpdated", {
            date: formatDate(lastUpdateTimestamp, "yyyy/MM/dd HH:mm", {
              timeZone,
            }),
          })}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" mt={1}>
        <Link
          href={"/schedule/all"}
          sx={{
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {t("footer.pages.home")}
        </Link>{" "}
        / <NextLink href={"/terms"}>{t("footer.pages.terms")}</NextLink> /{" "}
        <NextLink href={"/privacy-policy"}>
          {t("footer.pages.privacy")}
        </NextLink>
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        &copy; {t("spodule")} {getCurrentUTCDate().getFullYear()}
      </Typography>
    </Box>
  );
};
