"use client";

import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { IsraelFlag, UsaFlag } from "@/lib/flags";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "he" as const, Flag: IsraelFlag, label: "עברית" },
  { code: "en" as const, Flag: UsaFlag, label: "English" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label="בחירת שפה / Language"
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-charcoal/15 p-1",
        className
      )}
    >
      {LOCALES.map(({ code, Flag, label }) =>
        code === locale ? (
          <span
            key={code}
            aria-label={label}
            aria-current="true"
            className="rounded-full p-0.5 opacity-100 ring-1 ring-charcoal/25 shadow-sm"
          >
            <Flag className="h-3.5 w-5 rounded-[2px]" />
          </span>
        ) : (
          <Link
            key={code}
            href={pathname}
            locale={code}
            aria-label={label}
            className="rounded-full p-0.5 opacity-35 hover:opacity-65 transition-all"
          >
            <Flag className="h-3.5 w-5 rounded-[2px]" />
          </Link>
        )
      )}
    </div>
  );
}
