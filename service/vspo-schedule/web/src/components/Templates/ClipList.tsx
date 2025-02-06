import React, { useState } from "react";
import { Box, Grid2 as Grid, Pagination } from "@mui/material";
import { Clip } from "@/types/streaming";
import { ClipCard } from "../Elements";

type Props = {
  clips: Clip[];
};

export const ClipList: React.FC<Props> = ({ clips }) => {
  const [page, setPage] = useState(1);
  const clipsPerPage = 24;

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedClips = clips.slice(
    (page - 1) * clipsPerPage,
    page * clipsPerPage,
  );

  return (
    <>
      <Grid container spacing={3} sx={{ width: "100%" }}>
        {paginatedClips.map((clip) => (
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
          count={Math.ceil(clips.length / clipsPerPage)}
          page={page}
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
