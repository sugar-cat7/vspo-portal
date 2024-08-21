import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE, TIME_ZONE_HEADER } from "./lib/Const";

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

  // If the client does not have a time zone cookie set (i.e. the request does
  // not contain a time zone cookie), set the time zone cookie to be the first
  // valid time zone in:
  // - x-vercel-ip-timezone header
  // - default app time zone
  const cookieTimeZone = getCookieTimeZone(req);
  if (cookieTimeZone !== undefined) {
    return NextResponse.next();
  }
  const headerTimeZone = getHeaderTimeZone(req);
  const timeZoneToSet = headerTimeZone ?? DEFAULT_TIME_ZONE;
  setCookie(req, TIME_ZONE_COOKIE, timeZoneToSet);
  const res = NextResponse.next({ request: req });
  setCookie(res, TIME_ZONE_COOKIE, timeZoneToSet);
  return res;
};

const getCookieTimeZone = (req: NextRequest) => {
  return req.cookies.get(TIME_ZONE_COOKIE)?.value;
};

const getHeaderTimeZone = (req: NextRequest) => {
  return req.headers.get(TIME_ZONE_HEADER) ?? undefined;
};

const setCookie = (
  reqOrRes: NextRequest | NextResponse,
  name: string,
  value: string,
) => {
  reqOrRes.cookies.set({
    name,
    value,
    path: "/",
    maxAge: 34560000,
  });
};
