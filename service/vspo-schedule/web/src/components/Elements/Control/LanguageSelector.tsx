import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const localeLabels: Record<string, string> = {
  en: "English",
  ja: "日本語",
};

export const LanguageSelector = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const locale = router.locale;
  const locales = router.locales;

  return (
    locale !== undefined && (
      <TextField
        select
        size="small"
        id="language-select"
        label={t("drawer.language")}
        value={locale}
        onChange={(event) => {
          router.replace(
            { pathname: router.pathname, query: router.query },
            router.asPath,
            { locale: event.target.value },
          );
        }}
      >
        {locales !== undefined &&
          locales.map((loc) => (
            <MenuItem key={loc} value={loc}>
              {localeLabels[loc]}
            </MenuItem>
          ))}
      </TextField>
    )
  );
};
