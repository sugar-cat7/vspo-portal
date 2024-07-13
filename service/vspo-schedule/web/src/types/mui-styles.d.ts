// eslint-disable-next-line no-restricted-imports
import { CSSProperties } from "@mui/material/styles/createMixins";
import { DeepPartial } from "./deep-partial";

interface CustomPalette {
  customColors: {
    vspoPurple: string;
    darkBlue: string;
    gray: string;
    darkGray: string;
    videoHighlight: {
      live: string;
      upcoming: string;
      trending: string;
    };
  };
}

declare module "@mui/material/styles" {
  interface Mixins {
    scrollbar: CSSProperties;
  }

  interface Palette extends CustomPalette {}
  interface PaletteOptions extends DeepPartial<CustomPalette> {}
}
