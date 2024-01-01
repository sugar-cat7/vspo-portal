import React, { useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Box } from "@mui/system";
import { DrawerIcon } from "../Elements";
import { bottomNavigationContents } from "@/data/master";
import Link from "next/link";

export const CustomBottomNavigation: React.FC = () => {
  const [value, setValue] = useState(0);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const formattedDate = `${year}-${month}`;
  return (
    <Box sx={{ width: "100%", position: "fixed", bottom: 0, zIndex: 1000 }}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        showLabels
      >
        {bottomNavigationContents.map(({ id, name }) => {
          const link: string =
            id === "live"
              ? "/schedule/all"
              : id === "clip"
              ? "/clips"
              : id === "twitch-clip"
              ? "/twitch-clips"
              : id === "event"
              ? `/events/${formattedDate}`
              : `/#${id}`;

          return (
            <BottomNavigationAction
              component={Link}
              href={link}
              key={id}
              label={id === "live" ? "配信一覧" : name}
              value={id}
              icon={<DrawerIcon id={id} />}
            />
          );
        })}
      </BottomNavigation>
    </Box>
  );
};
