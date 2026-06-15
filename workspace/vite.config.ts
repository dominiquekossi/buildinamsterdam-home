import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  // svgr: `import Graphic from "./file.svg?react"` → React component (guide §7.3).
  // svgo is disabled so the extracted live geometry (ids #circle/#filter, the 6-layer
  // filter chain, class hooks) survives verbatim — optimization would strip/rename them.
  plugins: [react(), svgr({ svgrOptions: { svgo: false } })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
