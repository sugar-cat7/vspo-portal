import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ClipTabsAndListPresenter, TabOption } from "../presenters";
import { Clip, Pagination } from "../../domain/clip";

export type ClipTabsAndListProps = {
  clips: Clip[];
  pagination: Pagination;
  initialSortOption: string;
};

export const ClipTabsAndList: React.FC<ClipTabsAndListProps> = ({
  clips,
  pagination,
  initialSortOption,
}) => {
  const sortOptions: TabOption[] = [
    { value: "new", label: "New" },
    { value: "popular", label: "Popular" },
  ];

  const router = useRouter();

  const sortOptionIndex = sortOptions.findIndex(
    (opt) => opt.value === initialSortOption,
  );
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    sortOptionIndex !== -1 ? sortOptionIndex : 0,
  );

  const handleTabChange = (newValue: number) => {
    setSelectedTabIndex(newValue);
    const newSortOption = sortOptions[newValue].value;

    // Update the URL with the new sort option while keeping other query params
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          sort: newSortOption,
          page: 1, // Reset to first page when changing sort
        },
      },
      undefined,
      { shallow: true },
    );
  };

  const handlePageChange = (page: number) => {
    // Update the URL with the new page number while keeping other query params
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          page,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  // For trending option, we still need to update URL if needed
  useEffect(() => {
    if (selectedTabIndex === 3 && initialSortOption !== "trending") {
      // If selected trending tab but not on trending sort option,
      // update the URL to use trending sort
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            sort: "trending",
            page: 1,
          },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [selectedTabIndex, router, initialSortOption]);

  return (
    <ClipTabsAndListPresenter
      tabOptions={sortOptions}
      selectedTabIndex={selectedTabIndex}
      onTabChange={handleTabChange}
      clips={clips}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};
