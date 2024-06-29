import { Typography, Button, Box, Link, Avatar, Toolbar } from "@mui/material";
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
import { fetchEvents } from "@/lib/api";
import { TEMP_TIMESTAMP } from "@/lib/Const";

type Params = {
  id: string;
};

type Props = {
  event: VspoEvent;
  lastUpdateDate: string;
  id: string;
};

// https://nextjs.org/docs/pages/building-your-application/routing/internationalization#how-does-this-work-with-static-generation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getStaticPaths: GetStaticPaths<Params> = async ({ locales }) => {
  try {
    // FIXME: lang should be passed from the context
    const fetchedEvents = await fetchEvents({ lang: "ja" });
    const paths = fetchedEvents.map((event) => ({
      params: { id: event.newsId.toString() },
    }));

    return { paths, fallback: true };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
  locale,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const fetchedEvents = await fetchEvents({ lang: locale });
  if (!Array.isArray(fetchedEvents)) {
    return {
      notFound: true,
    };
  }
  const event = fetchedEvents.find((event) => event.newsId === params.id);
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
    <>
      <Toolbar disableGutters>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          戻る
        </Button>
      </Toolbar>

      <Box>
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
        <Box sx={{ marginBottom: "20px" }}>
          {event.contentSummary.split("\n").map((line, index) => {
            return (
              <Typography key={index} variant="body1">
                {line}
                <br />
              </Typography>
            );
          })}
        </Box>
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
    </>
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
      path={`/events/details/${pageProps.id}`}
      maxPageWidth="md"
    >
      {page}
    </ContentLayout>
  );
};
/* eslint-enable @typescript-eslint/no-unnecessary-condition */

export default EventPage;
