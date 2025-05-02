import { Clip } from "@/types/streaming";
import { Box, Grid2 as Grid, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { ClipCard } from "../Elements";

type PaginationType = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

type Props = {
  clips: Clip[];
  pagination: PaginationType;
};

export const ClipList: React.FC<Props> = ({ clips, pagination }) => {
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    // Update the URL with the new page number while keeping other query params
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: value,
      },
    }, undefined, { shallow: true });
  };

  return (
    <>
      <Grid container spacing={3} sx={{ width: "100%" }}>
        {clips.map((clip) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={clip.id}>
            <ClipCard clip={clip} />
          </Grid>
        ))}
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <Pagination
          count={pagination.totalPages}
          page={pagination.currentPage}
          onChange={handleChange}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
        />
      </Box>
    </>
  );
};
