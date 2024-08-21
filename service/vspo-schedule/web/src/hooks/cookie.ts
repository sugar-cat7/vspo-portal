import { useEffect, useState } from "react";

export const useCookie = (key: string, initialValue?: string) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(getCookie(key));
  }, [key]);

  const setCookie = (newValue: string | undefined) => {
    if (newValue === undefined) {
      document.cookie = `${key}=; expires=${new Date(0).toUTCString()}; path=/;`;
    } else {
      document.cookie = `${key}=${encodeURIComponent(newValue)}; max-age=34560000; path=/;`;
    }
    setValue(newValue);
  };

  return [value, setCookie] as const;
};

const getCookie = (key: string) => {
  if (typeof document === "undefined") {
    return undefined;
  }
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const parts = cookie.trim().split("=");
    if (parts[0] === key && parts.length >= 2) {
      const value = parts.slice(1).join("=");
      return decodeURIComponent(value);
    }
  }
  return undefined;
};
