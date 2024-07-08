import { faDiscord, faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import { NavigationRouteId } from "@/constants/navigation";
import { Platform } from "@/types/streaming";

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)(({ theme }) => ({
  color: "black",

  [theme.getColorSchemeSelector("dark")]: {
    color: "white",
  },
}));

type PlatformIconProps = { platform: Platform };

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform }) => {
  switch (platform) {
    case "youtube":
      return (
        <Image
          src="/youtube_social_icon_red.png"
          alt="Youtube Icon"
          style={{ objectFit: "cover" }}
          height={20}
          width={28.2}
        />
      );
    case "twitch":
      return (
        <StyledFontAwesomeIcon icon={faTwitch} style={{ height: "20px" }} />
      );
    case "twitcasting":
      return (
        <Image
          src="/twitcasting-icon.png"
          alt="Twitcasting"
          width="20"
          height="20"
        />
      );
    case "nicovideo":
      return (
        <Image src="/nc-icon.png" alt="nicovideo" width="20" height="20" />
      );
    default:
      return <></>;
  }
};

type DrawerIconProps = { id: NavigationRouteId };

export const DrawerIcon: React.FC<DrawerIconProps> = ({ id }) => {
  switch (id) {
    case "live":
      return <LiveTvIcon />;
    case "upcoming":
      return <CalendarTodayIcon />;
    case "archive":
      return <AllInboxIcon />;
    case "list":
      return <LiveTvIcon />;
    case "clip":
      return <ContentCutIcon />;
    case "qa":
      return <HelpOutlineIcon />;
    case "freechat":
      return <ChatBubbleOutlineIcon />;
    case "twitch-clip":
      return <AttachFileIcon />;
    case "site-news":
      return <NotificationsIcon />;
    case "event":
      return <EventIcon />;
    case "about":
      return <InfoIcon />;
    case "discord":
      return <FontAwesomeIcon icon={faDiscord} style={{ height: "20px" }} />;
    default:
      return <></>;
  }
};
