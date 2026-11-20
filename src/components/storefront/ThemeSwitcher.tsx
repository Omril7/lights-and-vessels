"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export const THEME_KEY = "lv-theme";

const THEMES = [
  { id: "paper", swatch: "#efe7d8", ink: "#1c1612" },
  { id: "evening", swatch: "#1c1612", ink: "#e6ddbf" },
  { id: "cobalt", swatch: "#1e4a8e", ink: "#f2ebda" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

function currentTheme(): ThemeId {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "evening" || t === "cobalt" ? t : "paper";
}

/**
 * Storefront colour themes (styles in globals.css, html[data-theme]).
 * The attribute is applied before paint by the boot script in app/layout.tsx;
 * this menu switches and remembers it.
 */
export function ThemeSwitcher() {
  const t = useTranslations("nav");
  const [theme, setTheme] = useState<ThemeId>("paper");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setTheme(currentTheme()), []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: ThemeId) => {
    setTheme(id);
    setOpen(false);
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("theme")}
        title={t("theme")}
        className="p-2 text-charcoal transition-colors hover:text-ink"
      >
        <SwatchIcon className="h-5 w-5" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("theme")}
          className="absolute end-0 top-full z-50 mt-1 min-w-[10rem] border border-charcoal/20 bg-cream py-1 shadow-lift"
        >
          {THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === th.id}
              onClick={() => choose(th.id)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-charcoal/[0.06]",
                theme === th.id ? "text-ink" : "text-charcoal/75"
              )}
            >
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center border border-charcoal/30 text-[0.6rem]"
                style={{ background: th.swatch, color: th.ink }}
              >
                א
              </span>
              {t(`themes.${th.id}`)}
              {theme === th.id && <span aria-hidden className="ms-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
