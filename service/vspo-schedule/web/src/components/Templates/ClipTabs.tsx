import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import { Clip, Platform } from "@/types/streaming";
import { ClipList } from "./ClipList ";
import { isTrending, shuffleClips, sortClipsByPopularity } from "@/lib/utils";
import { styled } from "@mui/material/styles";

type Props = {
  clips: Clip[];
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(6),

  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(3),
  },
}));

export const ClipTabs: React.FC<Props> = ({ clips }) => {
  const [value, setValue] = useState(
    clips.at(0)?.platform === Platform.YouTube ? 0 : 1,
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
    <>
      <StyledTabs value={value} onChange={handleChange} centered>
        <Tab label="新着👀" />
        <Tab label="人気✨" />
        <Tab label="おすすめ💡" />
        <Tab label="急上昇🔥" />
      </StyledTabs>
      <ClipList clips={sortedClips} />
    </>
  );
};
