import { members } from "@/data/members";
import { Timeframe } from "@/types/timeframe";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Autocomplete,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  MenuItem,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";

type Props = {
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
};

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: "4rem",
  right: "2rem",
  backgroundColor: theme.vars.palette.customColors.vspoPurple,

  [theme.getColorSchemeSelector("dark")]: {
    backgroundColor: theme.vars.palette.customColors.gray,
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
  setIsProcessing,
}) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchMemberIds, setSearchMemberIds] = React.useState<number[]>([]);
  const [searchClipTimeframe, setSearchClipTimeframe] =
    React.useState<Timeframe | null>("1week");
  const [searchKeyword, setSearchKeyword] = React.useState<string>("");
  const { t } = useTranslation("clips");

  // Initialize form values from URL query params when dialog opens
  React.useEffect(() => {
    if (isDialogOpen) {
      // Get current search params from URL
      const currentTimeframe = router.query.timeframe as Timeframe | undefined;
      const currentMemberIds = router.query.members ? 
        (Array.isArray(router.query.members) 
          ? router.query.members 
          : [router.query.members]).map(id => parseInt(id, 10)) 
        : [];
      const currentKeyword = router.query.keyword as string | undefined;

      // Set form values
      if (currentTimeframe) {
        setSearchClipTimeframe(currentTimeframe);
      }
      if (currentMemberIds.length > 0) {
        setSearchMemberIds(currentMemberIds);
      }
      if (currentKeyword) {
        setSearchKeyword(currentKeyword);
      }
    }
  }, [isDialogOpen, router.query]);

  const selectableMembers = members;

  const handleClickOpen = () => {
    setIsDialogOpen(true);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSearch = () => {
    setIsProcessing(true);
    
    // Build query parameters for server-side search
    const query: Record<string, string | string[]> = {
      ...router.query,
      page: "1", // Reset to first page for new search
    };
    
    // Add search parameters if they have values
    if (searchClipTimeframe) {
      query.timeframe = searchClipTimeframe;
    } else {
      delete query.timeframe;
    }
    
    if (searchMemberIds.length > 0) {
      query.members = searchMemberIds.map(id => id.toString());
    } else {
      delete query.members;
    }
    
    if (searchKeyword) {
      query.keyword = searchKeyword;
    } else {
      delete query.keyword;
    }
    
    // Navigate to the same page with search parameters
    router.push({
      pathname: router.pathname,
      query,
    });
    
    dialogClose();
  };

  const handleSelectMember = (memberIds: number[]) => {
    setSearchMemberIds(memberIds);
  };

  const timeframes: Timeframe[] = ["1day", "1week", "1month"];
  const translatedKeywords = t("searchDialog.keywords", {
    returnObjects: true,
  });
  const sampleKeywords: string[] = Array.isArray(translatedKeywords)
    ? translatedKeywords.map((keyword) => String(keyword))
    : [];
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
