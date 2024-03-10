import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Typography,
  Divider,
  Box,
  SwipeableDrawer,
  Button,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";
import React, { useState } from "react";
import Link from "next/link";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getNavigationRouteInfo,
  NavigationRouteId,
} from "@/constants/navigation";
import { DrawerIcon } from "../Icon";
import { ThemeToggleButton } from "../Button";

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

const StyledButton = styled(Button)({
  display: "flex",
  justifyContent: "flex-start",
  paddingLeft: "16px",
  "&:hover": {
    backgroundColor: "transparent",
  },
  borderRadius: 0,
  fontSize: "1rem",
  "& .MuiButton-startIcon": {
    marginLeft: 0,
    "& .MuiSvgIcon-root": {
      fontSize: "24px",
    },
  },
});

const AppBarOffset = styled("div")(({ theme }) => theme.mixins.toolbar);

const DrawerLinks: React.FC = () => {
  return (
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
                  <Typography variant="subtitle2" sx={{ padding: "8px 16px" }}>
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
  );
};

type DrawerProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const CustomDrawer: React.FC<DrawerProps> = ({
  open,
  onOpen,
  onClose,
}) => {
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      PaperProps={{
        style: {
          width: "240px",
          zIndex: 1200,
        },
      }}
      ModalProps={{
        keepMounted: true,
        disablePortal: true,
      }}
      SwipeAreaProps={{
        style: {
          position: "absolute",
        },
      }}
    >
      <AppBarOffset />

      <Stack direction="column" justifyContent="space-between" flex="1">
        <DrawerLinks />
        <StyledButton
          aria-label="settings"
          aria-controls="settings-menu"
          aria-haspopup="true"
          onClick={handleSettingsClick}
          color="inherit"
          startIcon={<SettingsIcon />}
        >
          設定
        </StyledButton>
        <Menu
          id="settings-menu"
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ top: "-30px" }}
        >
          <MenuItem
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 0,
            }}
          >
            <ThemeToggleButton />
          </MenuItem>
        </Menu>
      </Stack>
    </SwipeableDrawer>
  );
};
