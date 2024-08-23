import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/Const";
import { useCookie } from "./cookie";

export const useLocale = () => {
  return useCookie(LOCALE_COOKIE, DEFAULT_LOCALE);
};
