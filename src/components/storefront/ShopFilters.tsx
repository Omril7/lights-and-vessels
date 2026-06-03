"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type SortKey } from "@/types";
// CATEGORIES_DISABLED: import { CATEGORIES, type SortKey } from "@/types";
import { Dropdown } from "@/components/ui/Dropdown";
// import { cn } from "@/lib/utils"; // CATEGORIES_DISABLED (only needed for category pills)

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "החדש ביותר" },
  { key: "price-asc", label: "מחיר: מהנמוך לגבוה" },
  { key: "price-desc", label: "מחיר: מהגבוה לנמוך" },
];

export function ShopFilters({
  // CATEGORIES_DISABLED: activeCategory, showCategoryFilter,
  activeSort,
  total,
}: {
  // CATEGORIES_DISABLED: activeCategory: string; showCategoryFilter?: boolean;
  activeSort: SortKey;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-10 flex flex-col gap-5 border-b border-charcoal/10 pb-6 md:flex-row md:items-center md:justify-between">
      {/* CATEGORIES_DISABLED: category pills removed. To restore:
      {showCategoryFilter ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setParam("category", null)} className={cn("rounded-full border px-4 py-1.5 text-sm transition", !activeCategory ? "border-charcoal bg-charcoal text-cream" : "border-charcoal/25 text-charcoal hover:border-charcoal")}>הכול</button>
          {CATEGORIES.map((c) => (
            <button key={c.slug} onClick={() => setParam("category", c.slug)} className={cn("rounded-full border px-4 py-1.5 text-sm transition", activeCategory === c.slug ? "border-charcoal bg-charcoal text-cream" : "border-charcoal/25 text-charcoal hover:border-charcoal")}>{c.label}</button>
          ))}
        </div>
      ) : (<div />)}
      */}
      <div />

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-charcoal/50 sm:inline">
          {total} פריטים
        </span>
        <Dropdown
          ariaLabel="מיון פריטים"
          value={activeSort}
          onChange={(v) => setParam("sort", v)}
          options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
        />
      </div>
    </div>
  );
}
