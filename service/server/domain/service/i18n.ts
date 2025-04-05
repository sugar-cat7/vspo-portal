import { AsyncLocalStorage } from "node:async_hooks";
import cnTranslations from "../../public/locales/cn/discord.json";
import deTranslations from "../../public/locales/de/discord.json";
import defaultTranslations from "../../public/locales/default/discord.json";
import enTranslations from "../../public/locales/en/discord.json";
import esTranslations from "../../public/locales/es/discord.json";
import frTranslations from "../../public/locales/fr/discord.json";
import jaTranslations from "../../public/locales/ja/discord.json";
import koTranslations from "../../public/locales/ko/discord.json";
import twTranslations from "../../public/locales/tw/discord.json";

type RecursiveRecord<T> = {
  [key: string]: T | RecursiveRecord<T>;
};

type TranslationData = RecursiveRecord<string>;

const assertTranslationData = (data: unknown): TranslationData => {
  const isTranslationData = (value: unknown): value is TranslationData => {
    if (typeof value !== "object" || value === null) return false;
    return Object.entries(value).every(([_, v]) => {
      if (typeof v === "string") return true;
      return isTranslationData(v);
    });
  };

  if (!isTranslationData(data)) {
    throw new Error("Invalid translation data structure");
  }
  return data;
};

const translations = {
  ja: assertTranslationData(jaTranslations),
  en: assertTranslationData(enTranslations),
  cn: assertTranslationData(cnTranslations),
  de: assertTranslationData(deTranslations),
  es: assertTranslationData(esTranslations),
  fr: assertTranslationData(frTranslations),
  ko: assertTranslationData(koTranslations),
  tw: assertTranslationData(twTranslations),
  default: assertTranslationData(defaultTranslations),
} as const;

export type SupportedLanguage = keyof typeof translations;

type NestedKeyOf<T> = T extends string
  ? ""
  : T extends object
    ? {
        [K in keyof T]: K extends string
          ? T[K] extends object
            ? `${K}.${NestedKeyOf<T[K]>}`
            : K
          : never;
      }[keyof T]
    : never;

type TranslationKeys = NestedKeyOf<typeof jaTranslations>;

type ExtractPlaceholders<T extends string> =
  T extends `${string}{{${infer P}}}${infer Rest}`
    ? P | ExtractPlaceholders<Rest>
    : never;

type TranslationValue<T> = T extends string
  ? T
  : T extends object
    ? { [K in keyof T]: TranslationValue<T[K]> }[keyof T]
    : never;

type GetNestedValueType<
  T,
  K extends string,
> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? GetNestedValueType<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

type TranslationOptionsFor<K extends TranslationKeys> =
  | {
      [P in ExtractPlaceholders<
        TranslationValue<GetNestedValueType<typeof jaTranslations, K>>
      >]: string | number;
    }
  | undefined;

const getNestedValue = <K extends TranslationKeys>(
  obj: TranslationData,
  path: K,
): string | undefined => {
  const keys = path.split(".");
  let current: TranslationData | string = obj;

  for (const key of keys) {
    if (
      typeof current === "string" ||
      current === undefined ||
      current === null
    )
      return undefined;
    current = current[key];
  }

  return typeof current === "string" ? current : undefined;
};

const replacePlaceholders = <K extends TranslationKeys>(
  text: string,
  options?: TranslationOptionsFor<K>,
): string => {
  if (!options) return text;

  return text.replace(/{{([^}]+)}}/g, (_, key) => {
    const value = options[key.trim() as keyof typeof options];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
};

// Create AsyncLocalStorage instance to store language per request
const languageStorage = new AsyncLocalStorage<SupportedLanguage>();

const getCurrentLanguage = (): SupportedLanguage => {
  // Get language from AsyncLocalStorage context or default if not set
  return languageStorage.getStore() || "default";
};

/**
 * Run a function with a specific language context
 * @param language Language to use for the context
 * @param callback Function to run within the language context
 * @returns The result of the callback function
 */
export const runWithLanguage = <T>(language: string, callback: () => T): T => {
  return languageStorage.run(language as SupportedLanguage, callback);
};

export const t = <K extends TranslationKeys>(
  key: K,
  {
    translationOptions,
    languageCode,
  }: {
    translationOptions?: TranslationOptionsFor<K>;
    languageCode?: SupportedLanguage;
  } = {},
): string => {
  const currentLang = getCurrentLanguage();
  const translationData = languageCode
    ? translations[languageCode]
    : translations[currentLang];
  const value = getNestedValue(translationData, key);
  if (!value) {
    console.warn(
      `Translation not found for key: ${key} in language: ${languageCode ?? currentLang}`,
    );
    return key;
  }
  return replacePlaceholders(value, translationOptions);
};
