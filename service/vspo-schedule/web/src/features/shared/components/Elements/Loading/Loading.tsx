import { CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type Props = {};

export const Loading: React.FC<Props> = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
};
