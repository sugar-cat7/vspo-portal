import { CSSProperties } from "@mui/material/styles/createMixins";

declare module "@mui/material/styles" {
  interface Mixins {
    scrollbar: CSSProperties;
  }
}
