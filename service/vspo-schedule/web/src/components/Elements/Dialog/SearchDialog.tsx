import { members } from "@/data/members";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  FormControl,
  Autocomplete,
  TextField,
  Avatar,
  DialogActions,
  Button,
  Fab,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { applyFilters } from "@/lib/utils";
import { Clip } from "@/types/streaming";
import { Timeframe } from "@/types/timeframe";
import { timeframes } from "@/constants/timeframes";

type Props = {
  clips: Clip[];
  setFilteredClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
};

const sampleSearchKeywords = [
  "おれあぽ",
  "ニチアサ",
  "Apex",
  "Valorant",
  "雑談",
];

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: "4rem",
  right: "2rem",
  backgroundColor: "#7266cf",

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "#353535",
  },
}));

const StyledSearchIcon = styled(SearchIcon)({
  color: "white",
});

const StyledAlert = styled(Alert)(({ theme }) => ({
  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: "transparent",
  },
}));

export const SearchDialog: React.FC<Props> = ({
  clips,
  setFilteredClips,
  setIsProcessing,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchMemberIds, setSearchMemberIds] = React.useState<number[]>([]);
  const [searchClipTimeframe, setSearchClipTimeframe] =
    React.useState<Timeframe | null>(null);
  const [searchKeyword, setSearchKeyword] = React.useState<string>("");

  const selectableMembers =
    clips.at(0)?.platform === "twitch"
      ? members.filter((member) => member.twitchChannelId)
      : members;

  const handleClickOpen = () => {
    setIsDialogOpen(true);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSearch = () => {
    setIsProcessing(true);
    const filteredClips = applyFilters(
      clips,
      searchClipTimeframe,
      searchMemberIds,
      searchKeyword,
    );
    setFilteredClips(filteredClips);
    dialogClose();
  };

  const handleSelectMember = (memberIds: number[]) => {
    setSearchMemberIds(memberIds);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onClose={dialogClose} maxWidth="md" fullWidth>
        <DialogTitle>詳細検索</DialogTitle>
        <DialogContent>
          <StyledAlert severity="info" sx={{ marginBottom: 2 }}>
            現在1ヶ月以上前の切り抜きは検索できません。
          </StyledAlert>
          <TextField
            select
            label="期間"
            value={searchClipTimeframe || "1week"}
            onChange={(e) =>
              setSearchClipTimeframe(e.target.value as Timeframe)
            }
            sx={{ margin: "1rem 0", width: "100px" }}
          >
            {timeframes.map((timeframe) => (
              <MenuItem key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControl fullWidth sx={{ margin: "1rem 0" }}>
            <Autocomplete
              multiple
              id="member-select"
              options={selectableMembers}
              getOptionLabel={(option) => option.name}
              value={selectableMembers.filter((member) =>
                searchMemberIds.includes(member.id),
              )}
              onChange={(event, newValue) =>
                handleSelectMember(newValue.map((item) => item.id))
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar
                    src={option.iconUrl}
                    alt={option.name}
                    sx={{ marginRight: 1 }}
                  />
                  {option.name}
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="配信者" variant="outlined" />
              )}
            />
            <Autocomplete
              freeSolo
              id="keyword-autocomplete"
              options={sampleSearchKeywords}
              inputValue={searchKeyword}
              onInputChange={(event, newInputValue) => {
                setSearchKeyword(newInputValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="キーワード" variant="outlined" />
              )}
              sx={{ margin: "1rem 0" }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogClose} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleSearch} color="primary">
            検索
          </Button>
        </DialogActions>
      </Dialog>
      {/* +ボタン */}
      <StyledFab color="primary" aria-label="add" onClick={handleClickOpen}>
        <StyledSearchIcon />
      </StyledFab>
    </>
  );
};
