// /types/hls.d.ts
import Hls from "hls.js";

declare global {
  interface Window {
    Hls: typeof Hls;
  }
}
