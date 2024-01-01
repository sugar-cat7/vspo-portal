import React, { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  // Snackbar,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, styled } from "@mui/system";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { CustomDrawer } from "../Elements/Drawer/Drawer";
import Link from "next/link";
import { ThemeToggleButton, EmbedModeToggleButton } from "../Elements";
import SettingsIcon from "@mui/icons-material/Settings";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#212121" : "#7266cf",
  zIndex: 1300,
}));
const StyledTypography = styled(Typography)({
  fontFamily:
    "'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro', 'Hiragino Mincho Pro', 'ヒラギノ明朝 Pro', 'Hiragino Maru Gothic Pro', 'ヒラギノ丸ゴ Pro', sans-serif",
  fontWeight: "bold",
  fontSize: "0.9rem",
  // paddingTop: "3px",
});
const StyledSubtitle = styled(Typography)({
  fontFamily:
    "'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro', 'Hiragino Mincho Pro', 'ヒラギノ明朝 Pro', 'Hiragino Maru Gothic Pro', 'ヒラギノ丸ゴ Pro', sans-serif",
  fontWeight: "normal",
  fontSize: "0.5rem",
  paddingLeft: "0px",
});

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#e5f6fd" : "primary",
  color: theme.palette.mode === "dark" ? "#014361" : "primary",
}));

type Props = {
  title: string;
};
export const Header: React.FC<Props> = ({ title }) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleClose = () => {
    setAlertOpen(false);
    localStorage.setItem("headerAlertSeen5", "false");
  };

  useEffect(() => {
    const hasSeenAlert = localStorage.getItem("headerAlertSeen5");

    if (!hasSeenAlert) {
      setAlertOpen(true);
    }
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Link
              style={{
                display: "flex",
                // flexDirection: "column",
                // alignItems: "flex-start",
                // justifyContent: "center",
                width: "100%",
              }}
              href="/schedule/all"
            >
              <Image
                src="/icon-top_transparent.png"
                alt="Page Icon"
                width={40}
                height={40}
              />
              <Box>
                <StyledTypography variant="h6">すぽじゅーる</StyledTypography>
                <StyledSubtitle>{title}</StyledSubtitle>
              </Box>
            </Link>
            <Box
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* <a
                href="https://github.com/sugar-cat7/vspo-schedule-web"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginLeft: "12px",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  size="lg"
                  style={{
                    color: "white",
                    borderRadius: "50%",
                    padding: "3px",
                    paddingTop: "5px",
                  }}
                />
              </a> */}
              <a
                href="https://twitter.com/vspodule"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginLeft: "12px",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  size="lg"
                  style={{
                    color: "white",
                    borderRadius: "50%",
                    padding: "3px",
                    paddingTop: "5px",
                  }}
                />
              </a>
            </Box>
          </div>
        </Toolbar>
      </StyledAppBar>
      {/* SEO */}
      <Box id="nonevisible" sx={{ display: "none" }}>
        <CustomDrawer />
      </Box>

      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        onOpen={handleDrawerToggle}
        PaperProps={{
          style: {
            width: "240px",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <CustomDrawer />
        <IconButton
          aria-label="settings"
          aria-controls="settings-menu"
          aria-haspopup="true"
          onClick={handleSettingsClick}
          color="inherit"
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            paddingLeft: "16px",
            "&:hover": {
              backgroundColor: "transparent", // ホバーエフェクトを無効にする
            },
          }}
        >
          <SettingsIcon />
          <Typography variant="body1" style={{ marginLeft: "10px" }}>
            設定
          </Typography>
        </IconButton>
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
            // onClick={handleSettingsClose}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <ThemeToggleButton />
          </MenuItem>
          {/* <MenuItem
            // onClick={handleSettingsClose}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <EmbedModeToggleButton />
          </MenuItem> */}
        </Menu>
      </SwipeableDrawer>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{ marginTop: "48px" }}
      >
        <StyledAlert
          severity="info"
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          [お知らせ]
          <br />
          配信情報を通知するDiscord Botを公開しました！
          <br />
          サイドバーから追加できます。
        </StyledAlert>
      </Snackbar>
    </>
  );
};
