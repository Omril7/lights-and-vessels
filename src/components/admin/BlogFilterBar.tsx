"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "כל הסטטוסים" },
  { value: "published", label: "מפורסם" },
  { value: "draft", label: "טיוטה" },
];

export function buildBlogHref(params: {
  q?: string;
  status?: string;
  page?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.page && params.page !== "1") qs.set("page", params.page);
  const s = qs.toString();
  return s ? `/admin/blog?${s}` : "/admin/blog";
}

export function BlogFilterBar({
  initialQ,
  initialStatus,
  filtersActive,
}: {
  initialQ: string;
  initialStatus: string;
  filtersActive: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);

  function go(next: { q?: string; status?: string }) {
    router.push(buildBlogHref({ q: next.q ?? q, status: next.status ?? status }));
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
          placeholder="חיפוש כותרת או slug…"
          className="w-full rounded-xl border border-charcoal/15 bg-cream py-2.5 ps-9 pe-3 text-sm focus:outline-none focus:border-charcoal/50 focus:ring-2 focus:ring-gold/30"
        />
      </label>
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
          href="/admin/blog"
          className="rounded-full border border-charcoal/15 px-4 py-1.5 text-sm text-charcoal/70 hover:bg-charcoal/[0.05]"
        >
          ניקוי
        </Link>
      )}
    </form>
  );
}
