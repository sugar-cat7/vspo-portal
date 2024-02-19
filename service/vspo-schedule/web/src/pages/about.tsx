import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ContentLayout } from "@/components/Layout";
import { NextPageWithLayout } from "./_app";
import { aboutSections } from "@/data/master";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

const parseMarkdown = (text: string): JSX.Element[] => {
  const linkPattern = /\[(.+?)\]\((https?:\/\/.+?)\)/g;
  const imagePattern = /!\[(.*?)\]\((.+?)\)/g;
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
        <Box sx={{ maxWidth: "500px", margin: "20px" }} key={`img-${i}`}>
          <Image
            src={match[2]}
            alt={match[1]}
            layout="responsive"
            width={500}
            height={300}
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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const AboutPage: NextPageWithLayout = () => {
  return (
    <Box sx={{ paddingTop: 2, margin: "20px" }}>
      {aboutSections.map((section, index) => (
        <StyledAccordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>{parseMarkdown(section.content)}</AccordionDetails>
        </StyledAccordion>
      ))}
    </Box>
  );
};

AboutPage.getLayout = (page) => {
  return (
    <ContentLayout
      title="すぽじゅーるについて"
      description="すぽじゅーるについて概要をまとめています。"
      path="/about"
    >
      {page}
    </ContentLayout>
  );
};

export default AboutPage;
