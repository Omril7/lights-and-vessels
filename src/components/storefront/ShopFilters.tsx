"use client";

import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { type SortKey } from "@/types";
import { Dropdown } from "@/components/ui/Dropdown";

export function ShopFilters({
  activeSort,
  total,
}: {
  activeSort: SortKey;
  total: number;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const SORTS: { key: SortKey; label: string }[] = [
    { key: "curated", label: t("sortCurated") },
    { key: "price-asc", label: t("sortPriceAsc") },
    { key: "price-desc", label: t("sortPriceDesc") },
  ];

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-10 flex flex-col gap-5 border-b border-charcoal/10 pb-6 md:flex-row md:items-center md:justify-between">
      <div />

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-charcoal/50 sm:inline">
          {t("itemCount", { count: total })}
        </span>
        <Dropdown
          ariaLabel={t("sortLabel")}
          value={activeSort}
          onChange={(v) => setParam("sort", v)}
          options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
        />
      </div>
    </div>
  );
}
