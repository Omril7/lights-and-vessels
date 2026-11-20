"use client";

import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Link to the same page in the other language, shown as its code —
 * "EN" on the Hebrew site, "עב" on the English one (as on the entry page).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "he" ? "en" : "he";

  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      aria-label={other === "en" ? "English" : "עברית"}
      className={cn(
        "px-1.5 py-1 text-sm font-light text-ink transition-colors hover:text-accent",
        className
      )}
    >
      {other === "en" ? "EN" : "עב"}
    </Link>
  );
}
