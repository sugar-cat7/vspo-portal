import { platforms, sampleKeywords, timeframes } from "@/data/master";
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
import { filterLivestreams, applyFilters } from "@/lib/utils";
import { Livestream, Clip } from "@/types/streaming";
import { PlatformIcon } from "../Icon";

type Props = {
  livestreamsByDate?: Record<string, Livestream[]>;
  setFilteredLivestreamsByDate?: React.Dispatch<
    React.SetStateAction<Record<string, Livestream[]>>
  >;
  clips?: Clip[];
  setFilteredClips?: React.Dispatch<React.SetStateAction<Clip[]>>;
  searchTarget: "livestream" | "clip";
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
};

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

const StyledTextField = styled(TextField)(() => ({
  minWidth: "150px",
}));

export const SearchDialog: React.FC<Props> = ({
  livestreamsByDate,
  setFilteredLivestreamsByDate,
  clips,
  setFilteredClips,
  searchTarget,
  setIsProcessing,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchStartDate, setSearchStartDate] = React.useState<string | null>(
    null,
  );
  const [searchEndDate, setSearchEndDate] = React.useState<string | null>(null);
  const [searchMemberIds, setSearchMemberIds] = React.useState<number[]>([]);
  const [searchPlatforms, setSearchPlatforms] = React.useState<string[]>([]);
  const [searchClipTimeframe, setSearchClipTimeframe] = React.useState<
    string | null
  >(null);
  const [searchKeyword, setSearchKeyword] = React.useState<string>("");
  const handleClickOpen = () => {
    setIsDialogOpen(true);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSearch = () => {
    setIsProcessing(true);
    if (searchTarget === "livestream") {
      if (livestreamsByDate && setFilteredLivestreamsByDate) {
        if (
          !searchStartDate &&
          !searchEndDate &&
          searchMemberIds.length === 0 &&
          searchPlatforms.length === 0 &&
          searchKeyword === ""
        ) {
          setFilteredLivestreamsByDate(livestreamsByDate);
        } else {
          const filteredLivestreams = filterLivestreams(
            livestreamsByDate,
            searchStartDate,
            searchEndDate,
            searchMemberIds,
            searchPlatforms,
            searchKeyword,
          );
          setFilteredLivestreamsByDate(filteredLivestreams);
        }
      }
    } else {
      if (searchTarget === "clip") {
        if (clips && setFilteredClips) {
          const filteredClips = applyFilters(
            clips,
            searchClipTimeframe,
            searchMemberIds,
            searchKeyword,
          );
          setFilteredClips(filteredClips);
        }
      }
    }
    dialogClose();
  };

  const handleSelectMember = (memberIds: number[]) => {
    setSearchMemberIds(memberIds.map(Number));
  };

  return (
    <>
      <Dialog open={isDialogOpen} onClose={dialogClose} maxWidth="md" fullWidth>
        <DialogTitle>詳細検索</DialogTitle>
        <DialogContent>
          {searchTarget === "livestream" && (
            <>
              <StyledAlert severity="info" sx={{ marginBottom: 2 }}>
                現在1週間以上前の配信は検索できません。
              </StyledAlert>
              <StyledTextField
                label="開始日"
                type="date"
                value={searchStartDate || ""}
                onChange={(e) => setSearchStartDate(e.target.value)}
                sx={{ margin: "1rem 1rem 1rem 0" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <StyledTextField
                label="終了日"
                type="date"
                value={searchEndDate || ""}
                onChange={(e) => setSearchEndDate(e.target.value)}
                sx={{ margin: "1rem 0 1rem 0" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </>
          )}
          {searchTarget === "clip" && (
            <>
              <StyledAlert severity="info" sx={{ marginBottom: 2 }}>
                現在1ヶ月以上前の切り抜きは検索できません。
              </StyledAlert>
              <TextField
                select
                label="期間"
                value={searchClipTimeframe || "1week"}
                onChange={(e) => setSearchClipTimeframe(e.target.value)}
                sx={{ margin: "1rem 0", width: "100px" }}
              >
                {timeframes.map((timeframe) => (
                  <MenuItem key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
          <FormControl fullWidth sx={{ margin: "1rem 0" }}>
            {searchTarget === "livestream" && (
              <Autocomplete
                multiple
                id="platform-select"
                options={platforms}
                getOptionLabel={(option) => option.name}
                value={platforms.filter((platform) =>
                  searchPlatforms.includes(platform.id),
                )}
                onChange={(event, newValue) =>
                  setSearchPlatforms(newValue.map((item) => item.id))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <PlatformIcon platform={option.id} />
                    <Box component="span" sx={{ marginLeft: 1 }}>
                      {option.name}
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="配信場所" />
                )}
                sx={{ margin: "1rem 0" }}
              />
            )}
            <Autocomplete
              multiple
              id="member-select"
              options={members}
              getOptionLabel={(option) => option.name}
              value={members.filter((member) =>
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
              renderInput={(params) => <TextField {...params} label="配信者" />}
            />
            <Autocomplete
              freeSolo
              id="keyword-autocomplete"
              options={sampleKeywords}
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
