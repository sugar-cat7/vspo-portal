import { z } from "zod";

export const TargetLangSchema = z.enum([
  "en",
  "ja",
  "fr",
  "de",
  "es",
  "cn",
  "tw",
  "ko",
  "default",
]);

export const LangCodeLabelMapping = {
  en: "English",
  ja: "日本語",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  cn: "简体中文",
  tw: "繁體中文",
  ko: "한국어",
  default: "Default",
} as const;

export const LabeledTargetLangSchema = TargetLangSchema.transform((lang) => ({
  code: lang,
  label: LangCodeLabelMapping[lang],
}));

export type LabeledTargetLang = z.infer<typeof LabeledTargetLangSchema>;
