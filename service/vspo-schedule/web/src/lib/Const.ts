export const TEMP_TIMESTAMP = "1998-01-01T12:00:00Z";

export const DEFAULT_LOCALE = "ja";
export const DEFAULT_TIME_ZONE = "Asia/Tokyo";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const TIME_ZONE_COOKIE = "time-zone";
export const TIME_ZONE_HEADER = "x-vercel-ip-timezone";

export const QA_LINK = process.env.NEXT_PUBLIC_FORM;

export const DISCORD_LINK = process.env.NEXT_PUBLIC_DISCORD_LINK;

export const API_ROOT =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.API_ROOT;

export const ENVIRONMENT = process.env.ENVIRONMENT;
