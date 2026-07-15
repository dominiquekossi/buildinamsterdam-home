import type { Config } from "tailwindcss";

/**
 * Tokens below are VERIFIED from artifacts/guidelines.json + artifacts/crawl/css.css.
 * Geometry/spacing/motion values that are NOT in the artifacts (the styled-components
 * stylesheet was captured empty) are intentionally omitted here and will be added
 * after live inspection in Phase 3. Do not invent values to fill these gaps.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Verified breakpoint: ≥769px = horizontal split (desktop); ≤768px = stacked.
        // (guidelines.json + Phase 3 live inspection)
        desktop: "769px",
      },
      colors: {
        // Neutral baseline (guidelines.json → colors.baseline)
        white: "#FFFFFF",
        black: "#000000",
        "off-white": "#F2EFE6",
        "dark-gray": "#231F20",
        "light-gray": "#3E3739",
        grey: "#B3B3B3",
        // Secondary accents (guidelines.json → colors.secondary)
        blue: "#3C4CC7",
        terracotta: {
          DEFAULT: "#C38133",
          "2020": "#BA7160",
        },
      },
      fontFamily: {
        // guidelines.json → typography.*.technical.font_family_css
        "display": ["NHaasGroteskDSPro", "Helvetica", "Arial", "sans-serif"],
        "ui": ["NHaasGroteskTXPro", "Helvetica", "Arial", "sans-serif"],
        "serif-lead": ["RecklessNeue-Book", "Georgia", "serif"],
        "body": ["NeueHaasGrotesk-Roman", "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        // headline H2 (guidelines.json → typography.highlights)
        headline: "-0.04em",
      },
      lineHeight: {
        // headline H2 (guidelines.json → typography.titles)
        headline: "0.85",
      },
      borderRadius: {
        // buttons are square (guidelines.json → actions.button_list[].specs.radius)
        none: "0",
      },
    },
  },
  plugins: [],
};

export default config;
