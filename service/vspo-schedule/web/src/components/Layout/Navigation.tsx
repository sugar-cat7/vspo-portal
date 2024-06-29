import React, { useEffect, useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Box } from "@mui/system";
import { DrawerIcon } from "../Elements";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  getNavigationRouteInfo,
  NavigationRouteId,
} from "@/constants/navigation";
import { useTranslation } from "next-i18next";

const bottomNavigationRoutes = [
  "list",
  "clip",
  "twitch-clip",
  "event",
] satisfies NavigationRouteId[];

const getActiveNavOption = (activePath: string) => {
  const pathParts = activePath.split("/");
  if (pathParts.length < 2) {
    return undefined;
  }
  const basePath = pathParts.slice(0, 2).join("/");
  return bottomNavigationRoutes.find((id) => {
    const link = getNavigationRouteInfo(id).link;
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
  const { t } = useTranslation("common");

  useEffect(() => {
    const activeNavOption = getActiveNavOption(router.asPath);
    setValue(activeNavOption ?? "");
  }, [router.asPath]);

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
              href={getNavigationRouteInfo(id).link}
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
