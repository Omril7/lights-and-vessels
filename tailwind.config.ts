import type { Config } from "tailwindcss";

/**
 * A colour backed by a CSS variable (so themes can swap it) that still supports
 * Tailwind opacity modifiers: Tailwind fills <alpha-value> (1 when there's no
 * modifier), so `border-charcoal/35` becomes a color-mix with transparent.
 * A plain "var(--x)" string silently drops the modifier.
 */
function themed(name: string): string {
  return `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;
}

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — CSS variables in globals.css (see .claude/STYLE.md).
        // themed() lets opacity modifiers (border-charcoal/35) work on them.
        paper: { DEFAULT: themed("paper"), 2: themed("paper-2") },
        stone: { DEFAULT: themed("stone"), 2: themed("stone-2") },
        "ink-2": themed("ink-2"),
        cobalt: themed("cobalt"),
        moss: themed("moss"),
        ember: themed("ember"),
        beeswax: themed("beeswax"),
        accent: themed("accent"),
        stamp: themed("stamp"),
        // Legacy names — aliases of the brand palette until components migrate
        clay: themed("clay"),
        sand: themed("sand"),
        linen: themed("linen"),
        terracotta: themed("terracotta"),
        olive: themed("olive"),
        charcoal: themed("charcoal"),
        ink: themed("ink"),
        gold: themed("gold"),
        copper: themed("copper"),
        cream: themed("cream"),
      },
      fontFamily: {
        serif: ["var(--font-frank)", "Frank Ruhl Libre", "Georgia", "serif"],
        sans: ["var(--font-heebo)", "Heebo", "system-ui", "sans-serif"],
      },
      borderRadius: {
        organic: "62% 38% 46% 54% / 60% 56% 44% 40%",
      },
      boxShadow: {
        soft: "0 12px 40px -16px rgba(27, 23, 18, 0.28)",
        lift: "0 24px 60px -24px rgba(27, 23, 18, 0.35)",
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
        // Rubber-stamp press: a quick push down and back.
        stamp: {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(0.965)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 1.6s infinite",
        stamp: "stamp 0.32s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
