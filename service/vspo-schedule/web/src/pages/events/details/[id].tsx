import { Typography, Button, Box, Link, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../_app";
import { VspoEvent } from "@/types/events";
import { TweetEmbed } from "@/components/Elements";
import { formatWithTimeZone } from "@/lib/utils";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ContentLayout } from "@/components/Layout";
import { members } from "@/data/members";
import { fetchVspoEvents } from "@/lib/api";
import { TEMP_TIMESTAMP } from "@/lib/Const";
type Props = {
  event: VspoEvent;
  lastUpdateDate: string;
  id: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch events from API
  const fetchEvents: VspoEvent[] = await fetchVspoEvents();
  const paths = fetchEvents.map((event) => ({
    params: { id: event.newsId },
  }));

  // Fallback to true to handle non-existent paths
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }
  const fetchEvents: VspoEvent[] = await fetchVspoEvents();
  const event = fetchEvents.find((event) => event.newsId === params.id);
  if (!event) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      event: event,
      id: params.id,
      lastUpdateDate: formatWithTimeZone(new Date(), "ja", "yyyy/MM/dd HH:mm"),
    },
  };
};

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  [theme.breakpoints.down("sm")]: {
    width: 28,
    height: 28,
  },
}));

const EventPage: NextPageWithLayout<Props> = ({ event }) => {
  const router = useRouter();
  if (!event) {
    return null;
  }
  return (
    <Box sx={{ margin: "16px 40px 40px", width: "80%" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ marginBottom: "10px" }}
      >
        Back
      </Button>
      <Typography variant="h4" sx={{ marginBottom: "10px" }}>
        {event.title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <Typography color="textSecondary">
          {formatWithTimeZone(
            new Date(event.startedAt.split("T")[0] || TEMP_TIMESTAMP),
            "ja",
            "MM/dd (E)",
          )}
        </Typography>
        {members.map(
          (member, index) =>
            event.contentSummary.includes(
              (member.name || "").replace(" ", ""),
            ) && (
              <StyledAvatar
                key={index}
                alt={member.name}
                src={member.iconUrl}
              />
            ),
        )}
      </Box>
      <Typography variant="body1" sx={{ marginBottom: "20px" }}>
        {event.contentSummary.split("\n").map((line, index) => {
          return (
            <Typography key={index} variant="body1">
              {line}
              <br />
            </Typography>
          );
        })}
      </Typography>
      {event.tweetLinks.map((link, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <TweetEmbed tweetLink={link} />
        </Box>
      ))}
      {event.webPageLinks.length > 0 && (
        <Box sx={{ marginBottom: "20px" }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            Web Links:
          </Typography>
          {/* テキストを...にする */}
          {event.webPageLinks.map((link, index) => (
            <Link
              key={index}
              href={link}
              sx={{
                display: "block",
                marginBottom: "10px",
                wordBreak: "break-all",
              }}
            >
              {link}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
};

/* eslint-disable @typescript-eslint/no-unnecessary-condition --
 * pageProps is empty in fallback render
 */
EventPage.getLayout = (page, pageProps) => {
  const eventTitle = pageProps.event?.title ?? "Event Not Found";
  const eventContentSummary =
    pageProps.event?.contentSummary ?? "This event could not be found.";

  return (
    <ContentLayout
      title={eventTitle}
      description={eventContentSummary}
      path={`/events/${pageProps.id}`}
    >
      {page}
    </ContentLayout>
  );
};
/* eslint-enable @typescript-eslint/no-unnecessary-condition */

export default EventPage;
