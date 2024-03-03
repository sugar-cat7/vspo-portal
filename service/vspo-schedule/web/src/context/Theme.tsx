import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// Module augmentation to enable use of Theme variable with CssVarsProvider
// https://mui.com/material-ui/experimental-api/css-theme-variables/usage/#typescript
import type {} from "@mui/material/themeCssVarsAugmentation";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const theme = extendTheme({
  mixins: {
    scrollbar: {
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: ({ mixins }) => ({
        html: mixins.scrollbar,
      }),
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => theme.mixins.scrollbar,
      },
    },
  },
});

export const ThemeModeProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
};
