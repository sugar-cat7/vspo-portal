import { isTrending } from "@/lib/utils";
import { Clip } from "@/types/streaming";
import { Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ClipList } from "./ClipList";

type PaginationType = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

type Props = {
  clips: Clip[];
  pagination: PaginationType;
  initialSortOption: string;
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(6),

  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(3),
  },
}));

export const ClipTabs: React.FC<Props> = ({ clips, pagination, initialSortOption }) => {
  const sortOptions = ["new", "popular", "recommended", "trending"];
  const sortOptionIndex = sortOptions.indexOf(initialSortOption);
  const [value, setValue] = useState(sortOptionIndex !== -1 ? sortOptionIndex : 0);
  const router = useRouter();
  const { t } = useTranslation("clips");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const newSortOption = sortOptions[newValue];
    
    // Update the URL with the new sort option while keeping other query params
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        sort: newSortOption,
        page: 1, // Reset to first page when changing sort
      },
    }, undefined, { shallow: true });
  };

  // For trending option, we still need to filter client-side
  useEffect(() => {
    if (value === 3 && initialSortOption !== "trending") {
      // If selected trending tab but not on trending sort option,
      // update the URL to use trending sort
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          sort: "trending",
          page: 1,
        },
      }, undefined, { shallow: true });
    }
  }, [value, router, initialSortOption]);

  // Filter trending clips on client-side if needed
  const displayedClips = value === 3 ? clips.filter(c => isTrending(c)) : clips;

  return (
    <>
      <StyledTabs value={value} onChange={handleChange} centered>
        <Tab label={`${t("clipLabels.new")} 👀`} />
        <Tab label={`${t("clipLabels.popular")} ✨`} />
        <Tab label={`${t("clipLabels.recommended")} 💡`} />
        <Tab label={`${t("clipLabels.trending")} 🔥`} />
      </StyledTabs>
      <ClipList 
        clips={displayedClips} 
        pagination={pagination} 
      />
    </>
  );
};
