import { GetStaticProps, GetStaticPaths } from "next";
import { Notice } from "@/types/notice";
import { ContentLayout } from "@/components/Layout";
import { NextPageWithLayout } from "../_app";
import { Container, Typography, Chip } from "@mui/material";
import { Breadcrumb, TweetEmbed } from "@/components/Elements";
import { notifications } from "@/data/notifications";
import { getColor } from "@/lib/utils";
import { CustomBottomNavigation } from "@/components/Layout/Navigation";

type Params = {
  id: string;
};

type Props = {
  notice: Notice;
};

const NoticePage: NextPageWithLayout<Props> = ({ notice }) => {
  return (
    <Container maxWidth="md" sx={{ marginTop: "80px" }}>
      <Breadcrumb />
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ marginTop: "10px" }}
      >
        {notice.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        更新日: {notice.updated}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Tags:
        {notice.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            variant="outlined"
            color={getColor(tag)}
            sx={{ m: 0.5 }}
          />
        ))}
      </Typography>
      <Typography variant="body1" paragraph>
        {notice.content}
      </Typography>
      {notice.tweetLink && <TweetEmbed tweetLink={notice.tweetLink} />}
    </Container>
  );
};

NoticePage.getLayout = (page, pageProps) => {
  return (
    <ContentLayout
      title="すぽじゅーるからのお知らせ"
      description={pageProps.notice.content}
      path={`/notification/${pageProps.notice.id}`}
    >
      {page}
      <CustomBottomNavigation />
    </ContentLayout>
  );
};

export const getStaticProps: GetStaticProps<Props, Params> = ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const id = params.id;
  const notice = notifications.find((notice) => notice.id === Number(id));
  if (!notice) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      notice,
    },
  };
};

export const getStaticPaths: GetStaticPaths<Params> = () => {
  const paths = notifications.map((notice) => ({
    params: { id: notice.id.toString() },
  }));
  return { paths, fallback: false };
};

export default NoticePage;
