import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, earthy palette — defined as CSS variables in globals.css
        clay: "var(--clay)",
        sand: "var(--sand)",
        linen: "var(--linen)",
        terracotta: "var(--terracotta)",
        olive: "var(--olive)",
        charcoal: "var(--charcoal)",
        ink: "var(--ink)",
        gold: "var(--gold)",
        copper: "var(--copper)",
        cream: "var(--cream)",
      },
      fontFamily: {
        serif: ["var(--font-frank)", "Frank Ruhl Libre", "Georgia", "serif"],
        sans: ["var(--font-assistant)", "Assistant", "system-ui", "sans-serif"],
      },
      borderRadius: {
        organic: "62% 38% 46% 54% / 60% 56% 44% 40%",
      },
      boxShadow: {
        soft: "0 12px 40px -16px rgba(60, 47, 35, 0.28)",
        lift: "0 24px 60px -24px rgba(60, 47, 35, 0.35)",
      },
      letterSpacing: {
        wider2: "0.18em",
      },
      maxWidth: {
        editorial: "1320px",
      },
      transitionTimingFunction: {
        grace: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
