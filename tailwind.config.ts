import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // graphite machine void — the dark substrate every interface is etched on
        ink: {
          950: "#06070a",
          900: "#0a0c11",
          800: "#10131b",
          700: "#181d29",
          600: "#232a3b",
          500: "#333c52",
        },
        // signal blue — interface, the luminous primary; the glow of a live screen
        signal: {
          600: "#1f6fe0",
          500: "#3d8bfd",
          400: "#6fb2ff",
          300: "#a8d3ff",
        },
        // amber — tools, machinery, industry, the heat of manufacturing
        amber: {
          600: "#c8780c",
          500: "#f5a623",
          400: "#ffbe52",
          300: "#ffd98c",
        },
        // iris — the violet of intelligence, code, the AI-native layer
        iris: {
          600: "#6d3fd6",
          500: "#9b6dff",
          400: "#b794ff",
          300: "#d6c4ff",
        },
        // mint — function, utility, things that work (nods to Psy mint)
        mint: {
          600: "#11a079",
          500: "#2fd4a8",
          400: "#5fe3c0",
          300: "#9bf0d8",
        },
        // cool screen-light neutrals — text on graphite
        ghost: {
          50: "#f6f8fc",
          100: "#e8ecf4",
          200: "#c2cad8",
          300: "#8c95a8",
          500: "#596174",
          700: "#2d3340",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Manrope"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        zh: ['"Noto Sans SC"', "sans-serif"],
      },
      boxShadow: {
        panel: "inset 0 1px 0 rgba(168,211,255,0.06), 0 24px 60px -28px rgba(0,0,0,0.94)",
        glow: "0 0 40px -8px rgba(61,139,253,0.55)",
        glowamber: "0 0 36px -8px rgba(245,166,35,0.5)",
        glowiris: "0 0 36px -8px rgba(155,109,255,0.5)",
        glowmint: "0 0 36px -8px rgba(47,212,168,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
