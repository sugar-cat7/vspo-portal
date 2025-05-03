import { Loading } from "@/components/Elements";
import { Box } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { ClipTabsAndList } from "../../components";
import { Clip, Pagination } from "../../domain/clip";

export type YouTubeClipsPresenterProps = {
  clips: Clip[];
  pagination: Pagination;
  sortOption: string;
  isProcessing: boolean;
};

export const Presenter: React.FC<YouTubeClipsPresenterProps> = ({
  clips,
  pagination,
  sortOption,
  isProcessing,
}) => {
  const { t } = useTranslation("clips");

  if (!clips?.length) {
    return (
      <Box
        sx={{
          mt: 2,
          padding: "0 50px 50px",
        }}
      >
        {t("noClips")}
      </Box>
    );
  }

  return (
    <>
      {isProcessing ? (
        <Loading />
      ) : (
        <ClipTabsAndList
          clips={clips}
          pagination={pagination}
          initialSortOption={sortOption}
        />
      )}
    </>
  );
};
