import { Loading } from "@/components/Elements";
import { Clip, Pagination } from "@/features/clips/domain/clip";
import { Box } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { ClipTabsAndList } from "../../components";

export type TwitchClipsPresenterProps = {
  clips: Clip[];
  pagination: Pagination;
  sortOption: string;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
};

export const Presenter: React.FC<TwitchClipsPresenterProps> = ({
  clips,
  pagination,
  sortOption,
  isProcessing,
}) => {
  const { t } = useTranslation("clips");

  if (!clips) {
    return null;
  }

  return (
    <>
      {isProcessing ? (
        <Loading />
      ) : clips.length === 0 ? (
        <Box
          sx={{
            mt: 2,
            padding: "0 50px 50px",
          }}
        >
          {t("noClips")}
        </Box>
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
