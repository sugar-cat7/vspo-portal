import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ContentLayout } from "@/components/Layout";
import { NextPageWithLayout } from "./_app";
import { aboutSections } from "@/data/content/about-sections";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

const parseMarkdown = (text: string): JSX.Element[] => {
  const linkPattern = /\[(.+?)\]\((https?:\/\/.+?)\)/g;
  const imagePattern = /!\[(.*?)\]\((.+?)\)/g;
  const maxImageWidth = "500px";
  const lines = text.split("\n");

  return lines.map((line, i) => {
    const elements: ReactNode[] = [];
    let start = 0;

    const imageMatches = Array.from(line.matchAll(imagePattern));
    for (const match of imageMatches) {
      if (match.index !== undefined && match.index > start) {
        elements.push(line.slice(start, match.index));
      }
      elements.push(
        <Box sx={{ maxWidth: maxImageWidth, margin: "20px" }} key={`img-${i}`}>
          <Image
            src={match[2]}
            alt={match[1]}
            width="0"
            height="0"
            sizes={maxImageWidth}
            style={{ width: "100%", height: "auto" }}
          />
        </Box>,
      );
      start = match.index !== undefined ? match.index + match[0].length : 0;
    }

    const linkMatches = Array.from(line.matchAll(linkPattern));
    for (const match of linkMatches) {
      if (match.index !== undefined && match.index > start) {
        elements.push(line.slice(start, match.index));
      }
      elements.push(
        <Link href={match[2]} passHref key={`link-${i}`}>
          <Button variant="contained" color="primary">
            {match[1]}
          </Button>
        </Link>,
      );
      start = match.index !== undefined ? match.index + match[0].length : 0;
    }

    if (start < line.length) {
      elements.push(line.slice(start));
    }

    return (
      <Typography component="div" variant="body1" key={`text-${i}`}>
        {elements}
      </Typography>
    );
  });
};

const AboutPage: NextPageWithLayout = () => {
  return (
    <Stack direction="column" spacing={2}>
      {aboutSections.map((section, index) => (
        <Accordion disableGutters key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>{parseMarkdown(section.content)}</AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

AboutPage.getLayout = (page) => {
  return (
    <ContentLayout
      title="すぽじゅーるについて"
      description="すぽじゅーるについて概要をまとめています。"
      path="/about"
      maxPageWidth="md"
      padTop
    >
      {page}
    </ContentLayout>
  );
};

export default AboutPage;
