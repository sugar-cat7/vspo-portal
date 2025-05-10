import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timeZone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(timeZone);
dayjs.extend(utc);
dayjs.tz.setDefault("UTC");

const convertToUTC = (input: Date | string | number, template?: string) => {
  return dayjs.tz(input).utc().format(template);
};

const getCurrentUTCDate = () => {
  return dayjs.tz().toDate();
};

const convertToUTCDate = (input: Date | string | number) => {
  return dayjs.tz(input).utc().toDate();
};

const convertToUTCTimestamp = (
  dateStr: Date | string | number,
  tz: string,
): string => {
  return dayjs.tz(dateStr, tz).utc().format();
};

export {
  convertToUTC,
  convertToUTCDate,
  getCurrentUTCDate,
  convertToUTCTimestamp,
};

export type { ConfigType } from "dayjs";
