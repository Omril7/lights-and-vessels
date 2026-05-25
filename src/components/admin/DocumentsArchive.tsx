"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { Dropdown } from "@/components/ui/Dropdown";
import { DatePicker } from "@/components/ui/DatePicker";

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

export function DocumentsArchive() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
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
            ) : docs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-charcoal/50">אין מסמכים</td></tr>
            ) : (
              docs.map((d) => (
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
      </div>
    </div>
  );
}
