import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import {
  MemberOption,
  SearchDialogPresenter,
  SearchFormData,
  TimeframeOption,
} from "../presenters";

export type SearchDialogProps = {
  setIsProcessing: (isProcessing: boolean) => void;
};

export const SearchDialog: React.FC<SearchDialogProps> = ({
  setIsProcessing,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<SearchFormData>({
    keyword: (router.query.keyword as string) || "",
    members: Array.isArray(router.query.members)
      ? router.query.members
      : router.query.members
        ? [router.query.members]
        : [],
    timeframe: (router.query.timeframe as string) || "",
  });

  // This would come from an API or context in a real app
  const members: MemberOption[] = [];

  const timeframes: TimeframeOption[] = [
    { value: "1day", label: "last24Hours" },
    { value: "1week", label: "lastWeek" },
    { value: "1month", label: "lastMonth" },
  ];

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (
    field: keyof SearchFormData,
    value: string | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({
      keyword: "",
      members: [],
      timeframe: "",
    });
  };

  const handleSubmit = () => {
    setIsProcessing(true);

    // Build query params for the search
    const query: Record<string, string | string[]> = {
      ...router.query,
      page: "1", // Reset to page 1 for new searches
    };

    // Add search params if they have values
    if (formData.keyword) query.keyword = formData.keyword;
    else delete query.keyword;

    if (formData.members.length > 0) query.members = formData.members;
    else delete query.members;

    if (formData.timeframe) query.timeframe = formData.timeframe;
    else delete query.timeframe;

    // Navigate with updated search params
    router.push({
      pathname: router.pathname,
      query,
    });

    handleClose();
  };

  // Add a search button to the global UI (this could be connected via context or other global state)
  useEffect(() => {
    // This is just a stub - in a real app, you'd add a search button to the UI
    // and connect it to the handleOpen function

    // For example, add a keydown listener for Ctrl+F or Command+F
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        handleOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <SearchDialogPresenter
      open={open}
      onClose={handleClose}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onClear={handleClear}
      members={members}
      timeframes={timeframes}
    />
  );
};
