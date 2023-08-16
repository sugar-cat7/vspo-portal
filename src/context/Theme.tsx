import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createContext, useEffect, useMemo, useState } from "react";

export type ThemeType = "dark" | "light";

const useDarkMode = () => {
  const [mode, setMode] = useState<ThemeType>("light");

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme") as ThemeType;
    window.localStorage.setItem("theme", localTheme || "light");
    setMode(localTheme || "light");
  }, []);

  return [mode, setMode] as const;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeContext = createContext<
  [ThemeType, (theme: ThemeType) => void]
>(["light", () => {}]);

export const ThemeModeProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  const [mode, setMode] = useDarkMode();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              body {
                &::-webkit-scrollbar {
                  display: 'none';
                }
              }
            `,
          },
        },
      }),
    [mode]
  );

  useEffect(() => {
    window.localStorage.setItem("theme", mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeContext.Provider value={[mode, setMode]}>
        {children}
      </ThemeContext.Provider>
    </ThemeProvider>
  );
};
