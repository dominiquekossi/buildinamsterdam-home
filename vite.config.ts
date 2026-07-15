import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages deploys to /<repo-name>/
  base: "/buildinamsterdam-home/",
  plugins: [react(), svgr({ svgrOptions: { svgo: false } })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
