import { Box } from "@mui/material";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
  components?: Record<string, React.ComponentType<any>>;
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  components,
}) => {
  const defaultComponents = {
    h1: ({ children }: any) => (
      <Box component="h1" sx={{ fontSize: "2rem", fontWeight: "bold", mb: 2 }}>
        {children}
      </Box>
    ),
    h2: ({ children }: any) => (
      <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold", mt: 3, mb: 2 }}>
        {children}
      </Box>
    ),
    h3: ({ children }: any) => (
      <Box component="h3" sx={{ fontSize: "1.25rem", fontWeight: "bold", mt: 2, mb: 1 }}>
        {children}
      </Box>
    ),
    p: ({ children }: any) => (
      <Box component="p" sx={{ mb: 2, lineHeight: 1.7 }}>
        {children}
      </Box>
    ),
    ul: ({ children }: any) => (
      <Box component="ul" sx={{ mb: 2, pl: 3 }}>
        {children}
      </Box>
    ),
    ol: ({ children }: any) => (
      <Box component="ol" sx={{ mb: 2, pl: 3 }}>
        {children}
      </Box>
    ),
    li: ({ children }: any) => (
      <Box component="li" sx={{ mb: 0.5 }}>
        {children}
      </Box>
    ),
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
        {children}
      </a>
    ),
    img: ({ src, alt }: any) => (
      <Box sx={{ maxWidth: "500px", margin: "20px 0" }}>
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "auto" }}
        />
      </Box>
    ),
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ ...defaultComponents, ...components }}
    >
      {content}
    </ReactMarkdown>
  );
};