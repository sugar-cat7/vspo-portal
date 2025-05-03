import { Clip, Pagination as PaginationType } from "../../domain/clip";
import { Box, Grid, Pagination, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import React from "react";
import { ClipCardPresenter } from "./ClipCardPresenter";

export type TabOption = {
  value: string;
  label: string;
};

export type ClipTabsAndListPresenterProps = {
  tabOptions: TabOption[];
  selectedTabIndex: number;
  onTabChange: (index: number) => void;
  clips: Clip[];
  pagination: PaginationType;
  onPageChange: (page: number) => void;
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(6),

  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(3),
  },
}));

export const ClipTabsAndListPresenter: React.FC<
  ClipTabsAndListPresenterProps
> = ({
  tabOptions,
  selectedTabIndex,
  onTabChange,
  clips,
  pagination,
  onPageChange,
}) => {
  const { t } = useTranslation("clips");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  return (
    <>
      <StyledTabs value={selectedTabIndex} onChange={handleTabChange} centered>
        {tabOptions.map((option) => (
          <Tab
            key={option.value}
            label={`${t(`clipLabels.${option.value}`)}`}
          />
        ))}
      </StyledTabs>

      {/* Clip List Section */}
      <Grid container spacing={3} sx={{ width: "100%" }}>
        {clips.map((clip) => (
          <Grid item xs={12} sm={6} md={4} key={clip.id}>
            <ClipCardPresenter clip={clip} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination Section */}
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
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
        />
      </Box>
    </>
  );
};
