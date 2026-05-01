import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#050507",
        surface: "rgba(20,20,30,0.6)",
        particle: "#6B6B7A",
        accent: "#7B61FF",
        cyan: "#00D9FF"
      },
      boxShadow: {
        glow: "0 0 40px rgba(123, 97, 255, 0.18)"
      },
      backdropBlur: {
        strong: "20px"
      }
    }
  },
  plugins: []
};

export default config;
