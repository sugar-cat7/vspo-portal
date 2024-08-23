import { MenuItem, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useLocale } from "@/hooks";

const localeLabels: { [localeCode: string]: string } = {
  en: "English",
  ja: "日本語",
};

export const LanguageSelector = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [locale, setLocale] = useLocale();

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
          const selectedLocale = event.target.value;
          setLocale(selectedLocale);
          router.replace(router.asPath, undefined, {
            scroll: false,
            locale: selectedLocale,
          });
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
