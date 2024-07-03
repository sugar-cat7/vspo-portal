import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "ja"];
const defaultLocale = "ja";
const publicFileRegex = /\.(.*)$/;

export const middleware = (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    publicFileRegex.test(pathname)
  ) {
    return;
  }

  // Direct user to the first valid locale in:
  // - path prefix
  // - NEXT_LOCALE cookie
  // - Accept-Language header
  // - default app locale
  // and save the locale to NEXT_LOCALE if it isn't saved already.

  let res = NextResponse.next();
  const savedLocale = getSavedLocale(req);

  const prefixLocale = getPathPrefixLocale(req);
  if (prefixLocale !== undefined) {
    if (prefixLocale !== savedLocale) {
      saveLocaleToCookie(res, prefixLocale);
    }
    return res;
  }

  if (savedLocale !== undefined) {
    if (savedLocale !== defaultLocale) {
      res = NextResponse.redirect(createPrefixedResponseUrl(req, savedLocale));
    }
    return res;
  }

  const headerLocale = getHeaderLocale(req);
  if (headerLocale !== undefined) {
    if (headerLocale !== defaultLocale) {
      res = NextResponse.redirect(createPrefixedResponseUrl(req, headerLocale));
    }
    saveLocaleToCookie(res, headerLocale);
    return res;
  }

  saveLocaleToCookie(res, defaultLocale);
  return res;
};

const saveLocaleToCookie = (res: NextResponse, locale: string) => {
  res.cookies.set({
    name: "NEXT_LOCALE",
    value: locale,
    path: "/",
  });
};

const getSavedLocale = (req: NextRequest) => {
  return req.cookies.get("NEXT_LOCALE")?.value;
};

const getPathPrefixLocale = (req: NextRequest) => {
  const url = new URL(req.url);
  const localeCandidate = url.pathname.split("/")[1];
  return locales.includes(localeCandidate) ? localeCandidate : undefined;
};

const getHeaderLocale = (req: NextRequest) => {
  const acceptLanguageHeader = req.headers.get("accept-language");
  const headerLocales = acceptLanguageHeader?.split(",").map((part) => {
    return part.trimStart().slice(0, 2);
  });
  return headerLocales?.find((headerLocale) => locales.includes(headerLocale));
};

const createPrefixedResponseUrl = (req: NextRequest, locale: string) => {
  const reqUrl = req.nextUrl;
  return new URL(`/${locale}${reqUrl.pathname}${reqUrl.search}`, reqUrl);
};
