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
import { useTranslation } from "next-i18next";

type Props = {
  clips: Clip[];
  setFilteredClips: React.Dispatch<React.SetStateAction<Clip[]>>;
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
  const { t } = useTranslation("clips");

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

  const timeframes: Timeframe[] = ["1day", "1week", "1month"];
  const sampleKeywords: string[] = t("searchDialog.keywords", {
    returnObjects: true,
  });
  return (
    <>
      <Dialog open={isDialogOpen} onClose={dialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{t("searchDialog.title")}</DialogTitle>
        <DialogContent>
          <StyledAlert severity="info" sx={{ marginBottom: 2 }}>
            {t("searchDialog.alertMessage")}
          </StyledAlert>
          <TextField
            select
            label={t("searchDialog.timeframe")}
            value={searchClipTimeframe || "1week"}
            onChange={(e) =>
              setSearchClipTimeframe(e.target.value as Timeframe)
            }
            sx={{ margin: "1rem 0", width: "140px" }}
          >
            {timeframes.map((timeframe) => (
              <MenuItem key={timeframe} value={timeframe}>
                {t(`searchDialog.timeframes.${timeframe}`)}
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
                <TextField
                  {...params}
                  label={t("searchDialog.members")}
                  variant="outlined"
                />
              )}
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
                <TextField
                  {...params}
                  label={t("searchDialog.keyword")}
                  variant="outlined"
                />
              )}
              sx={{ margin: "1rem 0" }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogClose} color="primary">
            {t("searchDialog.cancel")}
          </Button>
          <Button onClick={handleSearch} color="primary">
            {t("searchDialog.search")}
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
