"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FireIcon as FireOutline } from "@heroicons/react/24/outline";
import { FireIcon as FireSolid } from "@heroicons/react/24/solid";

export const EVENING_KEY = "lv-evening";

/**
 * "Evening mode" — dims the storefront to a candlelit palette (html.evening,
 * styled in globals.css). The class is applied before paint by the boot
 * script in app/layout.tsx; this button only flips and remembers it.
 */
export function EveningToggle() {
  const t = useTranslations("nav");
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.classList.contains("evening"));
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    document.documentElement.classList.toggle("evening", next);
    try {
      localStorage.setItem(EVENING_KEY, next ? "1" : "0");
    } catch {
      /* private mode — the toggle still works for this visit */
    }
  };

  const Icon = on ? FireSolid : FireOutline;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={t("eveningMode")}
      title={t("eveningMode")}
      className={`p-2 transition-colors ${on ? "text-beeswax" : "text-charcoal hover:text-ink"}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
