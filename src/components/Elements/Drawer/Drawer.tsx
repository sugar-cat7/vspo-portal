import { sideBarContents } from "@/data/master";
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
import React from "react";
import Link from "next/link";

import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { styled } from "@mui/system";
import { QA_LINK, SUPPORT_LINK } from "@/lib/Const";
import { DrawerIcon } from "../Icon";

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  minWidth: "32px",
}));

const ChipStyle = styled(Chip)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.mode === "dark" ? "white" : "rgb(45, 75, 112)",
  border: `1px solid ${
    theme.palette.mode === "dark" ? "white" : "rgb(45, 75, 112)"
  }`,
}));

export const CustomDrawer: React.FC = () => {
  return (
    <div>
      <Toolbar />
      <List>
        <Typography variant="subtitle2" sx={{ padding: "8px 16px" }}>
          <ChipStyle label="Main Section" size="small" />
        </Typography>
        {sideBarContents.map(({ id, name }) => {
          const link =
            id === "list"
              ? "/"
              : id === "clip"
              ? "/clips"
              : id === "qa"
              ? QA_LINK
              : id === "support"
              ? SUPPORT_LINK
              : id === "notification"
              ? "/notifications"
              : id === "freechat"
              ? "/freechat"
              : id === "twitch-clip"
              ? "/twitch-clips"
              : id === "about"
              ? "/about"
              : "/schedule/" + id;
          const isExternalLink = id === "qa" || id == "support";

          if (id === "freechat") {
            return (
              <React.Fragment key={id}>
                <Link href={link || ""}>
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
                <Link href={link || ""}>
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
            <Link href={link || ""} key={id}>
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
