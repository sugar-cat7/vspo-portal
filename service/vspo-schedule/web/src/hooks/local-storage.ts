import { useEffect, useState } from "react";

export const useLocalStorage = (
  key: string,
  defaultValue?: string,
): ReturnType<typeof useState<string>> => {
  const [value, setValue] = useState(() => {
    if (typeof localStorage === "undefined") {
      return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    return storedValue ?? defaultValue;
  });

  useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem("key");
    } else {
      localStorage.setItem(key, value);
    }
  }, [key, value]);

  return [value, setValue];
};
