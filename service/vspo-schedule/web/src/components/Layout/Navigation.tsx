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

const bottomNavigationContents = [
  { id: "list", name: "配信一覧" },
  { id: "clip", name: "切り抜き" },
  { id: "twitch-clip", name: "クリップ" },
  { id: "event", name: "イベント" },
] as const satisfies { id: NavigationRouteId; name: string }[];

const getActiveNavOption = (activePath: string) => {
  const pathParts = activePath.split("/");
  if (pathParts.length < 2) {
    return undefined;
  }
  const basePath = pathParts.slice(0, 2).join("/");
  return bottomNavigationContents.find(({ id }) => {
    const link = getNavigationRouteInfo(id).link;
    return link.startsWith(basePath);
  });
};

export const CustomBottomNavigation: React.FC = () => {
  const [value, setValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const activeNavOption = getActiveNavOption(router.asPath);
    setValue(activeNavOption?.id || "");
  }, [router.asPath]);

  return (
    <Box sx={{ width: "100%", position: "fixed", bottom: 0, zIndex: 1000 }}>
      <BottomNavigation value={value} showLabels>
        {bottomNavigationContents.map(({ id, name }) => (
          <BottomNavigationAction
            component={Link}
            href={getNavigationRouteInfo(id).link}
            key={id}
            label={name}
            value={id}
            icon={<DrawerIcon id={id} />}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};
