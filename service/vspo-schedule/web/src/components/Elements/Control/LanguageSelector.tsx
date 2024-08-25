import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useLocale } from "@/hooks";

const localeLabels: { [localeCode: string]: string } = {
  en: "English",
  ja: "日本語",
  cn: "简体中文",
  tw: "繁體中文",
};

export const LanguageSelector = () => {
  const { t } = useTranslation("common");
  const { locale, setLocale } = useLocale();

  return (
    locale !== undefined && (
      <TextField
        select
        size="small"
        id="language-select"
        label={t("drawer.language")}
        value={locale}
        onChange={(event) => {
          const selectedLocale = event.target.value;
          setLocale(selectedLocale);
        }}
      >
        {Object.keys(localeLabels).map((loc) => (
          <MenuItem key={loc} value={loc}>
            {localeLabels[loc]}
          </MenuItem>
        ))}
      </TextField>
    )
  );
};
