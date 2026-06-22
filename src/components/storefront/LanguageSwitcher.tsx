"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { IsraelFlag, UsaFlag } from "@/lib/flags";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: "he" | "en") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label="בחירת שפה / Language"
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-charcoal/15 p-1",
        className
      )}
    >
      <button
        onClick={() => switchTo("he")}
        aria-label="עברית"
        aria-pressed={locale === "he"}
        className={cn(
          "rounded-full p-0.5 transition-all",
          locale === "he"
            ? "opacity-100 ring-1 ring-charcoal/25 shadow-sm"
            : "opacity-35 hover:opacity-65"
        )}
      >
        <IsraelFlag className="h-3.5 w-5 rounded-[2px]" />
      </button>
      <button
        onClick={() => switchTo("en")}
        aria-label="English"
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-full p-0.5 transition-all",
          locale === "en"
            ? "opacity-100 ring-1 ring-charcoal/25 shadow-sm"
            : "opacity-35 hover:opacity-65"
        )}
      >
        <UsaFlag className="h-3.5 w-5 rounded-[2px]" />
      </button>
    </div>
  );
}
