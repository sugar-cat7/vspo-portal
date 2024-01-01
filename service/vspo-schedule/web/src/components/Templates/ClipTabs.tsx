// components/ClipTabs.tsx
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { Clip, Platform } from "@/types/streaming";
import { ClipList } from "./ClipList ";
import { isTrending, shuffleClips, sortClipsByPopularity } from "@/lib/utils";

type Props = {
  clips: Clip[];
};

export const ClipTabs: React.FC<Props> = ({ clips }) => {
  const [value, setValue] = useState(
    clips.at(0)?.platform === Platform.YouTube ? 0 : 1
  );
  const [sortedClips, setSortedClips] = useState(clips);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (value === 1) {
      const sortedClipsByPopularity = sortClipsByPopularity([...clips]);
      setSortedClips(sortedClipsByPopularity);
    } else if (value === 2) {
      const shuffled = shuffleClips([...clips]);
      setSortedClips(shuffled);
    } else if (value === 3) {
      const trendingClip = clips.filter((c) => isTrending(c));
      setSortedClips(trendingClip);
    } else {
      setSortedClips([...clips]);
    }
  }, [value, clips]);

  return (
    <Box sx={{ paddingTop: "80px" }}>
      <Tabs value={value} onChange={handleChange} centered>
        <Tab label="新着👀" />
        <Tab label="人気✨" />
        <Tab label="おすすめ💡" />
        <Tab label="急上昇🔥" />
      </Tabs>
      <Box>
        <ClipList clips={sortedClips} />
      </Box>
    </Box>
  );
};
