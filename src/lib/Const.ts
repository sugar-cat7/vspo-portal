export const TEMP_TIMESTAMP = "1998-01-01T12:00:00Z";

export const QA_LINK = process.env.NEXT_PUBLIC_FORM;

export const SUPPORT_LINK = process.env.NEXT_PUBLIC_SUPPORT_LINK;

export const API_ROOT =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.API_ROOT;

export const ENVIRONMENT = process.env.ENVIRONMENT;
