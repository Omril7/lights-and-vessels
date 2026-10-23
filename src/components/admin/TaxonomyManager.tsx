"use client";

import { Button, LocalizedInput } from "@/components/ui";
import { IsraelFlag, UsaFlag } from "@/lib/flags";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export type TaxonomyRow = {
  id: string;
  name_he: string;
  name_en: string | null;
  /** Number of products using this row. */
  count: number;
};

const COPY = {
  categories: {
    endpoint: "/api/admin/product-categories",
    listKey: "category",
    added: "הקטגוריה נוספה",
    confirmDelete: "למחוק את הקטגוריה? המוצרים בה יישארו ללא קטגוריה.",
    empty: "אין עדיין קטגוריות.",
  },
  tags: {
    endpoint: "/api/admin/product-tags",
    listKey: "tag",
    added: "התגית נוספה",
    confirmDelete: "למחוק את התגית? היא תוסר מכל המוצרים.",
    empty: "אין עדיין תגיות.",
  },
} as const;

const cell =
  "w-full rounded-lg border border-charcoal/15 bg-cream px-3 py-2 text-sm text-ink focus:border-charcoal/50 focus:outline-none focus:ring-2 focus:ring-gold/30";

export function TaxonomyManager({
  kind,
  initial,
}: {
  kind: keyof typeof COPY;
  initial: TaxonomyRow[];
}) {
  const copy = COPY[kind];
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [nameHe, setNameHe] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!nameHe.trim() || !nameEn.trim()) {
      toast.error("יש למלא שם בעברית ובאנגלית");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(copy.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_he: nameHe, name_en: nameEn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      const row = data[copy.listKey];
      setRows((prev) => [...prev, { ...row, count: row._count?.products ?? 0 }]);
      setNameHe("");
      setNameEn("");
      toast.success(copy.added);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  async function save(
    row: TaxonomyRow,
    field: "name_he" | "name_en",
    value: string
  ) {
    const next = value.trim();
    if (next === (row[field] ?? "")) return;
    if (!next) {
      toast.error("השם לא יכול להיות ריק");
      // Revert the visible value.
      setRows((prev) => [...prev]);
      return;
    }
    const res = await fetch(`${copy.endpoint}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "שגיאה בשמירה");
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [field]: next } : r))
    );
    toast.success("נשמר");
    router.refresh();
  }

  async function remove(row: TaxonomyRow) {
    if (!confirm(copy.confirmDelete)) return;
    const res = await fetch(`${copy.endpoint}/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("שגיאה במחיקה");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    toast.success("נמחק");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={add}
        className="grid items-end gap-3 rounded-2xl border border-charcoal/10 bg-cream p-4 shadow-soft sm:grid-cols-[1fr_1fr_auto]"
      >
        <LocalizedInput
          id="new-name-he"
          locale="he"
          label="שם בעברית"
          value={nameHe}
          onChange={(e) => setNameHe(e.target.value)}
        />
        <LocalizedInput
          id="new-name-en"
          locale="en"
          label="Name in English"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={saving}>
          הוספה
        </Button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-charcoal/10 bg-cream shadow-soft">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-charcoal/50">
            {copy.empty}
          </p>
        ) : (
          <ul className="divide-y divide-charcoal/5">
            <li className="hidden grid-cols-[1fr_1fr_5rem_2.5rem] gap-3 bg-linen/60 px-4 py-3 text-xs uppercase tracking-wider2 text-charcoal/60 sm:grid">
              <span className="flex items-center gap-1.5">
                <IsraelFlag className="h-3 w-[1.1rem] rounded-[2px]" />
                עברית
              </span>
              <span className="flex items-center gap-1.5">
                <UsaFlag className="h-3 w-[1.1rem] rounded-[2px]" />
                English
              </span>
              <span>מוצרים</span>
              <span />
            </li>
            {rows.map((row) => (
              <li
                key={row.id}
                className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_1fr_5rem_2.5rem]"
              >
                <input
                  defaultValue={row.name_he}
                  onBlur={(e) => save(row, "name_he", e.target.value)}
                  aria-label="שם בעברית"
                  dir="rtl"
                  className={cell}
                />
                <input
                  defaultValue={row.name_en ?? ""}
                  onBlur={(e) => save(row, "name_en", e.target.value)}
                  aria-label="Name in English"
                  dir="ltr"
                  className={cell}
                />
                <span className="text-sm text-charcoal/60">{row.count}</span>
                <button
                  type="button"
                  onClick={() => remove(row)}
                  aria-label="מחיקה"
                  className="text-charcoal/40 hover:text-terracotta"
                >
                  <TrashIcon className="h-5 w-5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
