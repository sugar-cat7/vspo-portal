import { Typography, Button, Box, Link, Avatar, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../_app";
import { VspoEvent } from "@/types/events";
import { TweetEmbed } from "@/components/Elements";
import { formatDate } from "@/lib/utils";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ContentLayout } from "@/components/Layout";
import { members } from "@/data/members";
import { fetchEvents } from "@/lib/api";
import { DEFAULT_LOCALE, TEMP_TIMESTAMP } from "@/lib/Const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

type Params = {
  id: string;
};

type Props = {
  event: VspoEvent;
  lastUpdateDate: string;
  id: string;
  meta: {
    title: string;
    description: string;
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async ({ locales }) => {
  // Fetch events from API
  const fetchedEvents = await fetchEvents();
  const paths =
    locales === undefined
      ? fetchedEvents.map((event) => ({ params: { id: event.newsId } }))
      : fetchedEvents.flatMap((event) => {
          return locales.map((locale) => ({
            params: { id: event.newsId },
            locale,
          }));
        });

  // Fallback to true to handle non-existent paths
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
  locale = DEFAULT_LOCALE,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const fetchedEvents = await fetchEvents();
  const event = fetchedEvents.find((event) => event.newsId === params.id);
  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "events"])),
      event: event,
      id: params.id,
      lastUpdateDate: formatDate(new Date(), "yyyy/MM/dd HH:mm '(UTC)'"),
      meta: {
        title: event.title,
        description: event.contentSummary,
      },
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
  const { t } = useTranslation(["common"]);
  const locale = router.locale ?? DEFAULT_LOCALE;

  if (!event) {
    return null;
  }
  return (
    <>
      <Toolbar disableGutters>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          {t("back", { ns: "common" })}
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
            {formatDate(
              new Date(event.startedAt.split("T")[0] || TEMP_TIMESTAMP),
              "MM/dd (E)",
              { localeCode: locale, timeZone: "JST" },
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

EventPage.getLayout = (page, pageProps) => (
  <ContentLayout
    title={pageProps.meta?.title}
    description={pageProps.meta?.description}
    path={`/events/details/${pageProps.id}`}
    maxPageWidth="md"
  >
    {page}
  </ContentLayout>
);

export default EventPage;
