import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

// Type for date search form data
export type DateSearchFormData = {
  selectedDate: Date | null;
  memberType: string;
  platform: string;
};

export type DateSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  dateInputValue: string;
  formData: DateSearchFormData;
  isSearchEnabled: boolean;
  onDateInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMemberTypeChange: (event: SelectChangeEvent) => void;
  onPlatformChange: (event: SelectChangeEvent) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export const DateSearchDialog: React.FC<DateSearchDialogProps> = ({
  open,
  onClose,
  dateInputValue,
  formData,
  isSearchEnabled,
  onDateInputChange,
  onMemberTypeChange,
  onPlatformChange,
  onSubmit,
  onClear,
}) => {
  const { t } = useTranslation("schedule");

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t("search.title", "Date Search")}</DialogTitle>
      <DialogContent>
        <FormGroup sx={{ mt: 1 }}>
          <FormControl fullWidth margin="normal">
            <TextField
              label={t("search.selectDate", "Select Date")}
              type="date"
              value={dateInputValue}
              onChange={onDateInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: "2030-12-31",
                min: "2020-01-01",
              }}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="member-type-select-label">
              {t("search.memberType", "Member Type")}
            </InputLabel>
            <Select
              labelId="member-type-select-label"
              id="member-type-select"
              value={formData.memberType}
              label={t("search.memberType", "Member Type")}
              onChange={onMemberTypeChange}
            >
              <MenuItem value="vspo_all">
                {t("search.memberType.all", "All Members")}
              </MenuItem>
              <MenuItem value="vspo_jp">
                {t("search.memberType.jp", "Japanese")}
              </MenuItem>
              <MenuItem value="vspo_en">
                {t("search.memberType.en", "English")}
              </MenuItem>
              <MenuItem value="vspo_ch">
                {t("search.memberType.ch", "Chinese")}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="platform-select-label">
              {t("search.platform", "Platform")}
            </InputLabel>
            <Select
              labelId="platform-select-label"
              id="platform-select"
              value={formData.platform}
              label={t("search.platform", "Platform")}
              onChange={onPlatformChange}
            >
              <MenuItem value="">
                {t("search.platform.all", "All Platforms")}
              </MenuItem>
              <MenuItem value="youtube">
                {t("search.platform.youtube", "YouTube")}
              </MenuItem>
              <MenuItem value="twitch">
                {t("search.platform.twitch", "Twitch")}
              </MenuItem>
              <MenuItem value="twitcasting">
                {t("search.platform.twitcasting", "TwitCasting")}
              </MenuItem>
              <MenuItem value="niconico">
                {t("search.platform.niconico", "Niconico")}
              </MenuItem>
            </Select>
          </FormControl>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClear}>{t("search.clear", "Clear")}</Button>
        <Button onClick={onClose}>{t("search.cancel", "Cancel")}</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={!isSearchEnabled}
        >
          {t("search.search", "Search")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
