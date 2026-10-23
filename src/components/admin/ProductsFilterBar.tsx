"use client";

import { Dropdown } from "@/components/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "all", label: "כל הסטטוסים" },
  { value: "published", label: "פעיל" },
  { value: "draft", label: "טיוטה" },
  { value: "featured", label: "מומלץ" },
  { value: "soldout", label: "אזל מהמלאי" },
];

function buildHref(params: {
  q?: string;
  category?: string;
  status?: string;
  page?: string;
}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== "all") qs.set(k, v);
  });
  const s = qs.toString();
  return s ? `/admin/products?${s}` : "/admin/products";
}

export function ProductsFilterBar({
  categories,
  initialQ,
  initialCategory,
  initialStatus,
  filtersActive,
}: {
  categories: { slug: string; label: string }[];
  initialQ: string;
  initialCategory: string;
  initialStatus: string;
  filtersActive: boolean;
}) {
  const router = useRouter();
  const categoryOptions = [
    { value: "all", label: "כל הקטגוריות" },
    ...categories.map((c) => ({ value: c.slug, label: c.label })),
  ];
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);

  function go(next: { q?: string; category?: string; status?: string }) {
    router.push(
      buildHref({
        q: next.q ?? q,
        category: next.category ?? category,
        status: next.status ?? status,
      })
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go({});
      }}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-charcoal/10 bg-cream p-3 shadow-soft"
    >
      <label className="relative min-w-0 flex-1 sm:min-w-[18rem]">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40"
          aria-hidden
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש לפי שם או תגית…"
          className="w-full rounded-xl border border-charcoal/15 bg-cream py-2.5 ps-9 pe-3 text-sm focus:outline-none focus:border-charcoal/50 focus:ring-2 focus:ring-gold/30"
        />
      </label>

      <Dropdown
        value={category}
        options={categoryOptions}
        onChange={(v) => {
          setCategory(v);
          go({ category: v });
        }}
        ariaLabel="קטגוריה"
      />
      <Dropdown
        value={status}
        options={STATUS_OPTIONS}
        onChange={(v) => {
          setStatus(v);
          go({ status: v });
        }}
        ariaLabel="סטטוס"
      />

      <button
        type="submit"
        className="rounded-full bg-charcoal px-4 py-1.5 text-sm text-cream hover:bg-ink"
      >
        חיפוש
      </button>
      {filtersActive && (
        <Link
          href="/admin/products"
          className="rounded-full border border-charcoal/15 px-4 py-1.5 text-sm text-charcoal/70 hover:bg-charcoal/[0.05]"
        >
          ניקוי
        </Link>
      )}
    </form>
  );
}
