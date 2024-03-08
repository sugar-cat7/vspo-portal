import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Chip,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import Link from "next/link";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getNavigationRouteInfo,
  NavigationRouteId,
} from "@/constants/navigation";
import { DrawerIcon } from "../Icon";

const drawerContents = [
  { id: "live", name: "配信中" },
  { id: "upcoming", name: "配信予定" },
  { id: "archive", name: "アーカイブ" },
  { id: "freechat", name: "フリーチャット" },
  { id: "clip", name: "切り抜き一覧" },
  { id: "twitch-clip", name: "クリップ一覧" },
  { id: "about", name: "すぽじゅーるについて" },
  { id: "site-news", name: "お知らせ" },
  { id: "qa", name: "お問い合わせ" },
  { id: "discord", name: "Discord Bot" },
] as const satisfies { id: NavigationRouteId; name: string }[];

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  minWidth: "32px",
}));

const ChipStyle = styled(Chip)(({ theme }) => ({
  backgroundColor: "transparent",
  border: "1px solid",
  borderColor: "rgb(45, 75, 112)",
  color: "rgb(45, 75, 112)",

  [theme.getColorSchemeSelector("dark")]: {
    borderColor: "white",
    color: "white",
  },
}));

export const CustomDrawer: React.FC = () => {
  return (
    <div>
      <Toolbar />
      <List>
        <Typography variant="subtitle2" sx={{ padding: "8px 16px" }}>
          <ChipStyle label="Main Section" size="small" />
        </Typography>
        {drawerContents.map(({ id, name }) => {
          const { link, isExternalLink } = getNavigationRouteInfo(id);

          if (id === "freechat") {
            return (
              <React.Fragment key={id}>
                <Link href={link}>
                  <ListItem>
                    <StyledListItemIcon>
                      <DrawerIcon id={id} />
                    </StyledListItemIcon>
                    <ListItemText primary={name} />
                  </ListItem>
                </Link>
                <Divider />
                <Typography variant="subtitle2" sx={{ padding: "8px 16px" }}>
                  <ChipStyle label="Clips Section" size="small" />
                </Typography>
              </React.Fragment>
            );
          }

          if (id === "clip" || id === "twitch-clip") {
            return (
              <React.Fragment key={id}>
                <Link href={link}>
                  <ListItem>
                    <StyledListItemIcon>
                      <DrawerIcon id={id} />
                    </StyledListItemIcon>
                    <Box sx={{ marginRight: "4px" }}>
                      {id === "twitch-clip" && (
                        <FontAwesomeIcon icon={faTwitch} />
                      )}
                    </Box>
                    <ListItemText primary={name} />
                    <Chip
                      label="Beta"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: "5px",
                        right: id === "twitch-clip" ? "40px" : "55px",
                        backgroundColor: "rgb(45, 75, 112)",
                        color: "white",
                        // border: "1px solid rgb(45, 75, 112)",
                        transform: "scale(0.65)",
                        zIndex: -1,
                      }}
                    />
                  </ListItem>
                </Link>
                {id === "twitch-clip" && (
                  <>
                    <Divider />
                    <Typography
                      variant="subtitle2"
                      sx={{ padding: "8px 16px" }}
                    >
                      <ChipStyle label="Help Section" size="small" />
                    </Typography>
                  </>
                )}
              </React.Fragment>
            );
          }

          return isExternalLink ? (
            <a href={link} key={id} target="_blank" rel="noopener noreferrer">
              <ListItem>
                <StyledListItemIcon>
                  <DrawerIcon id={id} />
                </StyledListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </a>
          ) : (
            <Link href={link} key={id}>
              <ListItem>
                <StyledListItemIcon>
                  <DrawerIcon id={id} />
                </StyledListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </Link>
          );
        })}
      </List>
    </div>
  );
};
