import React from "react";
import { LinkOwnProps, Link as MuiLink } from "@mui/material";
import { useRouter } from "next/router";
import { DEFAULT_LOCALE } from "@/lib/Const";

export const Link: React.FC<
  LinkOwnProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({ children, href, sx, ...props }) => {
  const router = useRouter();
  const locale = router?.locale ?? DEFAULT_LOCALE;

  return (
    <MuiLink
      href={`/${locale}${href}`}
      sx={{
        color: "inherit",
        textDecoration: "none",
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiLink>
  );
};
