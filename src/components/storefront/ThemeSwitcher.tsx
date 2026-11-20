"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export const THEME_KEY = "lv-theme";

const THEMES = [
  { id: "paper", swatch: "#efe7d8" },
  { id: "evening", swatch: "#1c1612" },
  { id: "cobalt", swatch: "#1e4a8e" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

function currentTheme(): ThemeId {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "evening" || t === "cobalt" ? t : "paper";
}

/**
 * Three-state colour theme button: each click moves to the next theme
 * (paper → evening → cobalt → paper). Shows the current theme's swatch and name.
 * Styles live in globals.css (html[data-theme]); the boot script in
 * app/layout.tsx applies the saved theme before paint.
 */
export function ThemeSwitcher() {
  const t = useTranslations("nav");
  const [theme, setTheme] = useState<ThemeId>("paper");

  useEffect(() => setTheme(currentTheme()), []);

  const index = THEMES.findIndex((th) => th.id === theme);
  const next = THEMES[(index + 1) % THEMES.length];
  const current = THEMES[index];

  const cycle = () => {
    const id = next.id;
    setTheme(id);
    const root = document.documentElement;
    if (id === "paper") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", id);
    try {
      localStorage.setItem(THEME_KEY, id);
      localStorage.removeItem("lv-evening"); // legacy key from the old toggle
    } catch {
      /* private mode — the switch still applies for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t("themeCycle", {
        current: t(`themes.${current.id}`),
        next: t(`themes.${next.id}`),
      })}
      title={t("themeCycle", {
        current: t(`themes.${current.id}`),
        next: t(`themes.${next.id}`),
      })}
      className="flex items-center gap-1.5 px-1.5 py-1 text-sm font-light text-ink transition-colors hover:text-accent"
    >
      <span
        aria-hidden
        className="h-3 w-3 border border-charcoal/50"
        style={{ background: next.swatch }}
      />
      {/* {t(`themes.${current.id}`)} */}
    </button>
  );
}
