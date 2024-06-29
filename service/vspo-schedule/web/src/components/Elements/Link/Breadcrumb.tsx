// components/Elements/Breadcrumb.tsx
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useTranslation } from "next-i18next";

export const Breadcrumb = () => {
  const router = useRouter();
  const pathnames = router.asPath.split("/").slice(1);
  const { t } = useTranslation("common");

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link href="/" component={NextLink} color="inherit">
        {t("breadcrumbs.pages.home")}
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const name = t(`breadcrumbs.pages.${value}`, value);

        return last ? (
          <Typography color="text.primary" key={to}>
            {name}
          </Typography>
        ) : (
          <Link key={to} href={to} component={NextLink} color="inherit">
            {name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
