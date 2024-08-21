import React, { useEffect, useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Box } from "@mui/system";
import { DrawerIcon, Link } from "../Elements";
import { useRouter } from "next/router";
import {
  getNavigationRouteInfo,
  NavigationRouteId,
} from "@/constants/navigation";
import { useTranslation } from "next-i18next";
import { useTimeZoneContext } from "@/hooks";
import { DEFAULT_LOCALE } from "@/lib/Const";

const bottomNavigationRoutes = [
  "list",
  "clip",
  "twitch-clip",
  "event",
] satisfies NavigationRouteId[];

const getActiveNavOption = (
  activePath: string,
  timeZone: string,
  locale: string,
) => {
  const pathParts = activePath.split("/");
  if (pathParts.length < 2) {
    return undefined;
  }
  const basePath = pathParts.slice(0, 2).join("/");
  return bottomNavigationRoutes.find((id) => {
    const link = getNavigationRouteInfo(id, timeZone, locale).link;
    return link.startsWith(basePath);
  });
};

const bottomNavigationHeight = "56px";

const BottomNavigationOffset = () => (
  <div style={{ height: bottomNavigationHeight }}></div>
);

export const CustomBottomNavigation: React.FC = () => {
  const [value, setValue] = useState("");
  const router = useRouter();
  const { timeZone } = useTimeZoneContext();
  const { t } = useTranslation("common");
  const locale = router.locale ?? DEFAULT_LOCALE;

  useEffect(() => {
    const activeNavOption = getActiveNavOption(router.asPath, timeZone, locale);
    setValue(activeNavOption ?? "");
  }, [router.asPath, timeZone]);

  return (
    <>
      <BottomNavigationOffset />
      <Box sx={{ width: "100%", position: "fixed", bottom: 0, zIndex: 1000 }}>
        <BottomNavigation
          value={value}
          showLabels
          sx={{ height: bottomNavigationHeight }}
        >
          {bottomNavigationRoutes.map((id) => (
            <BottomNavigationAction
              component={Link}
              href={getNavigationRouteInfo(id, timeZone, locale).link}
              key={id}
              label={t(`bottomNav.pages.${id}`)}
              value={id}
              icon={<DrawerIcon id={id} />}
            />
          ))}
        </BottomNavigation>
      </Box>
    </>
  );
};
