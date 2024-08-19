import React, { createContext } from "react";
import { useCookie } from "@/hooks";
import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE } from "@/lib/Const";

type ContextProps = {
  timeZone: string;
  setTimeZone: (timeZone?: string) => void;
};

export const TimeZoneContext = createContext<ContextProps | undefined>(
  undefined,
);

export const TimeZoneContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [timeZone, setTimeZone] = useCookie(
    TIME_ZONE_COOKIE,
    DEFAULT_TIME_ZONE,
  );

  return (
    <TimeZoneContext.Provider
      value={{
        timeZone: timeZone ?? DEFAULT_TIME_ZONE,
        setTimeZone,
      }}
    >
      {children}
    </TimeZoneContext.Provider>
  );
};
