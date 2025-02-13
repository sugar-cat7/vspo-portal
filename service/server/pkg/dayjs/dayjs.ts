import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timeZone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LOCALE_TIMEZONE_MAP, type TargetLang } from "../../domain/translate";

dayjs.extend(customParseFormat);
dayjs.extend(timeZone);
dayjs.extend(utc);
dayjs.tz.setDefault("UTC");

const convertToUTC = (input: Date | string | number) => {
  return dayjs.tz(input).utc().format();
};

const getCurrentUTCDate = () => {
  return dayjs.tz().toDate();
};

const getCurrentUTCString = () => {
  return dayjs.tz().format();
};

const convertToUTCDate = (input: Date | string | number) => {
  return dayjs.tz(input).utc().toDate();
};

/**
 * Returns a date formatted according to the specified language and time zone.
 * @param input Date | string | number (ISO8601, UNIX timestamp, Date object)
 * @param lang TargetLang (ISO 639-1 language code)
 * @returns A string formatted in the local format for the specified language
 */
const formatToLocalizedDate = (
  input: Date | string | number,
  lang: TargetLang,
): string => {
  const { locale, timeZone } = LOCALE_TIMEZONE_MAP[lang];

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
    hour12: locale.startsWith("en") || locale.startsWith("es"), // en, es use AM/PM notation
  }).format(convertToUTCDate(input));
};

export {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
  getCurrentUTCString,
  formatToLocalizedDate,
};
