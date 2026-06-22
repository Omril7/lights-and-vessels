"use client";

import { DatePicker, Dropdown } from "@/components/ui";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Doc = {
  id: string;
  number?: string;
  type: number;
  amount?: number;
  currency?: string;
  documentDate?: string;
  creationDate?: string;
};

const DOC_TYPE_LABELS: Record<number, string> = {
  320: "חשבונית מס/קבלה",
  330: "חשבונית זיכוי",
  400: "קבלה",
  305: "חשבונית מס",
};

const TYPE_FILTERS = [
  { value: "all", label: "הכול" },
  { value: "400", label: "קבלה" },
  { value: "320", label: "חשבונית מס/קבלה" },
  { value: "330", label: "זיכויים" },
];

const PAGE_SIZE = 25;

export function DocumentsArchive() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setPage(1);
    try {
      const params = new URLSearchParams();
      if (type !== "all") params.set("type", type);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/morning/documents?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "תקלה");
      setDocs(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "תקלה בטעינת מסמכים");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadPdf(id: string) {
    if (downloadingId) return;
    setDownloadingId(id);
    try {
      const res = await fetch(`/api/morning/documents/${id}`);
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "אין PDF זמין");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "תקלה");
    } finally {
      setDownloadingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(docs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageDocs = docs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function pageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const out: (number | "…")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) out.push("…");
    for (let i = start; i <= end; i++) out.push(i);
    if (end < total - 1) out.push("…");
    out.push(total);
    return out;
  }

  return (
    <div className="space-y-4">
      <div className="grid items-end gap-3 rounded-2xl border border-charcoal/10 bg-cream p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider2 text-charcoal/60">סוג</span>
          <Dropdown
            ariaLabel="סוג מסמך"
            variant="field"
            value={type}
            onChange={setType}
            options={TYPE_FILTERS.map((t) => ({ value: t.value, label: t.label }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider2 text-charcoal/60">מתאריך</span>
          <DatePicker ariaLabel="מתאריך" value={from} onChange={setFrom} max={to || undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider2 text-charcoal/60">עד</span>
          <DatePicker ariaLabel="עד תאריך" value={to} onChange={setTo} min={from || undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider2 text-charcoal/60">חיפוש</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="מספר / שם לקוח"
            className="w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <button
          onClick={load}
          className="h-12 rounded-full bg-charcoal px-5 text-sm text-cream hover:bg-ink"
        >
          סנן
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-cream shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-linen/60 text-xs uppercase tracking-wider2 text-charcoal/60">
            <tr>
              <th className="px-4 py-3 text-start">מספר</th>
              <th className="px-4 py-3 text-start">סוג</th>
              <th className="px-4 py-3 text-start">תאריך</th>
              <th className="px-4 py-3 text-end">סכום</th>
              <th className="px-4 py-3 text-end">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-charcoal/50">טוען…</td></tr>
            ) : pageDocs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-charcoal/50">אין מסמכים</td></tr>
            ) : (
              pageDocs.map((d) => (
                <tr key={d.id} className="border-t border-charcoal/5">
                  <td className="px-4 py-3 text-charcoal" dir="ltr">{d.number || d.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-charcoal/80">{DOC_TYPE_LABELS[d.type] || d.type}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {d.documentDate || d.creationDate ? formatDate(d.documentDate || d.creationDate!) : "—"}
                  </td>
                  <td className="px-4 py-3 text-end text-charcoal">
                    {typeof d.amount === "number" ? formatPrice(d.amount) : "—"}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={() => downloadPdf(d.id)}
                      disabled={downloadingId === d.id}
                      className="rounded-full border border-charcoal/30 px-3 py-1 text-xs text-charcoal hover:border-charcoal disabled:opacity-50"
                    >
                      {downloadingId === d.id ? "פותח…" : "הורד PDF"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 border-t border-charcoal/10 bg-linen/40 px-4 py-3 text-sm">
            <p className="text-charcoal/60">
              עמוד {safePage} מתוך {totalPages} ({docs.length} מסמכים)
            </p>
            <div className="flex items-center gap-1">
              <PagerBtn onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} aria-label="עמוד קודם">
                <ChevronRightIcon className="h-4 w-4" aria-hidden />
              </PagerBtn>
              {pageNumbers(safePage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`gap-${i}`} className="px-2 text-charcoal/40" aria-hidden>…</span>
                ) : (
                  <PagerBtn key={n} onClick={() => setPage(n)} active={n === safePage}>{n}</PagerBtn>
                )
              )}
              <PagerBtn onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} aria-label="עמוד הבא">
                <ChevronLeftIcon className="h-4 w-4" aria-hidden />
              </PagerBtn>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function PagerBtn({
  onClick,
  active,
  disabled,
  children,
  ...rest
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm transition-colors",
        active ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-charcoal/[0.06]",
        disabled && "pointer-events-none opacity-30"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
