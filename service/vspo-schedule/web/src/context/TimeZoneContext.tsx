import React, { createContext } from "react";
import { useLocalStorage } from "@/hooks";

type ContextProps = {
  timeZone?: string;
  setTimeZone: (timeZone?: string) => void;
};

export const TimeZoneContext = createContext<ContextProps | undefined>(
  undefined,
);

export const TimeZoneContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timeZone, setTimeZone] = useLocalStorage("time-zone", defaultTimeZone);

  return (
    <TimeZoneContext.Provider value={{ timeZone, setTimeZone }}>
      {children}
    </TimeZoneContext.Provider>
  );
};
