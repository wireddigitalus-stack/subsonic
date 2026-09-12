import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090E",
        foreground: "#F1F5F9",
        ios: {
          dark: "#0B0E14",
          surface: "#111622",
          elevated: "#171E2E",
          card: "rgba(17, 22, 34, 0.72)",
          border: "rgba(255, 255, 255, 0.08)",
          glass: "rgba(15, 20, 31, 0.65)",
          glassHover: "rgba(25, 33, 50, 0.8)",
          subtle: "rgba(255, 255, 255, 0.04)",
        },
        tactical: {
          amber: "#F59E0B",
          gold: "#EAB308",
          orange: "#F97316",
          red: "#EF4444",
          green: "#10B981",
          cyan: "#06B6D4",
          blue: "#3B82F6",
          muted: "#94A3B8",
          dark: "#05070A",
        },
      },
      boxShadow: {
        "ios-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        "ios-card": "0 4px 24px -1px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "tactical-glow": "0 0 25px -4px rgba(245, 158, 11, 0.35)",
        "tactical-blue": "0 0 25px -4px rgba(59, 130, 246, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
