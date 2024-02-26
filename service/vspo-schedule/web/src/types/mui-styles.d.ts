// eslint-disable-next-line no-restricted-imports
import { CSSProperties } from "@mui/material/styles/createMixins";

declare module "@mui/material/styles" {
  interface Mixins {
    scrollbar: CSSProperties;
  }
}
