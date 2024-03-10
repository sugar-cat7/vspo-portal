import React, { useEffect, useState } from "react";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/system";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { CustomDrawer } from "../Elements";
import { AlertSnackbar } from "../Elements/Snackbar";

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
});
const StyledSubtitle = styled(Typography)({
  fontFamily:
    "'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro', 'Hiragino Mincho Pro', 'ヒラギノ明朝 Pro', 'Hiragino Maru Gothic Pro', 'ヒラギノ丸ゴ Pro', sans-serif",
  fontWeight: "normal",
  fontSize: "0.5rem",
  paddingLeft: "0px",
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
  const [alertOpen, setAlertOpen] = useState(false);

  const handleAlertClose = () => {
    setAlertOpen(false);
    localStorage.setItem("alertSeen", "true");
  };

  useEffect(() => {
    const hasSeenAlert = localStorage.getItem("alertSeen");

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

      <AlertSnackbar open={alertOpen} onClose={handleAlertClose} />
    </>
  );
};
