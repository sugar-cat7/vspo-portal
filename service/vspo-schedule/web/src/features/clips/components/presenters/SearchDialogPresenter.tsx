import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  OutlinedInput,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "next-i18next";

// Type for search form data
export type SearchFormData = {
  keyword: string;
  members: string[];
  timeframe: string;
};

export type MemberOption = {
  id: string;
  name: string;
};

export type TimeframeOption = {
  value: string;
  label: string;
};

export type SearchDialogPresenterProps = {
  open: boolean;
  onClose: () => void;
  formData: SearchFormData;
  onChange: (field: keyof SearchFormData, value: string | string[]) => void;
  onSubmit: () => void;
  onClear: () => void;
  members: MemberOption[];
  timeframes: TimeframeOption[];
};

export const SearchDialogPresenter: React.FC<SearchDialogPresenterProps> = ({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  onClear,
  members,
  timeframes,
}) => {
  const { t } = useTranslation("clips");

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t("search.title")}</DialogTitle>
      <DialogContent>
        <FormGroup sx={{ mt: 1 }}>
          <TextField
            label={t("search.keyword")}
            value={formData.keyword}
            onChange={(e) => onChange("keyword", e.target.value)}
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>{t("search.members")}</InputLabel>
            <Select
              multiple
              value={formData.members}
              onChange={(e: SelectChangeEvent<string[]>) => {
                onChange("members", e.target.value);
              }}
              input={<OutlinedInput label={t("search.members")} />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((memberId) => {
                    const member = members.find((m) => m.id === memberId);
                    return (
                      <Chip key={memberId} label={member?.name || memberId} />
                    );
                  })}
                </Box>
              )}
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>{t("search.timeframe")}</InputLabel>
            <Select
              value={formData.timeframe}
              onChange={(e) => onChange("timeframe", e.target.value)}
              label={t("search.timeframe")}
            >
              <MenuItem value="">{t("search.anyTime")}</MenuItem>
              {timeframes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(`search.${option.label}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClear}>{t("search.clear")}</Button>
        <Button onClick={onClose}>{t("search.cancel")}</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {t("search.search")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
