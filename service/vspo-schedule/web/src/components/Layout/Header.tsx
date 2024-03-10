import React, { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  IconButton,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/system";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { CustomDrawer } from "../Elements";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#7266cf",
  zIndex: 1300,

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#212121",
  },
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

const StyledAlert = styled(Alert)({
  backgroundColor: "#e5f6fd",
  color: "#014361",
});

const SocialIconLink: React.FC<{
  url: string;
  icon: React.ReactNode;
}> = ({ url, icon }) => {
  const clickTargetSize = "24px";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: clickTargetSize,
        height: clickTargetSize,
        fontSize: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </a>
  );
};

const AppBarOffset = styled("div")(({ theme }) => theme.mixins.toolbar);

type Props = {
  title: string;
};
export const Header: React.FC<Props> = ({ title }) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

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

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawerOpen = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={toggleDrawerOpen}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Link
              style={{
                display: "flex",
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
                gap: "12px",
                marginLeft: "12px",
              }}
            >
              <SocialIconLink
                url="https://github.com/sugar-cat7/vspo-portal"
                icon={<FontAwesomeIcon icon={faGithub} />}
              />
              <SocialIconLink
                url="https://twitter.com/vspodule"
                icon={<FontAwesomeIcon icon={faXTwitter} />}
              />
            </Box>
          </div>
        </Toolbar>
      </StyledAppBar>

      <AppBarOffset />

      <CustomDrawer
        open={drawerOpen}
        onOpen={toggleDrawerOpen}
        onClose={toggleDrawerOpen}
      />

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
