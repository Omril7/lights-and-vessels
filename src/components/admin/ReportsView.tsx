"use client";

import { DatePicker } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ReportRow = { date: string; amount: number; type?: number };
type ReportPayload = { from: string; to: string; rows?: ReportRow[] };

function toMonthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

const MONTH_LABELS = [
  "ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני",
  "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳",
];

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}'`;
}

export function ReportsView() {
  const today = new Date();
  const yearAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const [from, setFrom] = useState(iso(yearAgo));
  const [to, setTo] = useState(iso(today));
  const [data, setData] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/morning/reports?from=${from}&to=${to}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "תקלה");
      setData(body);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "תקלה בטעינת דוח");
      setData({ from, to, rows: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data?.rows ?? []) {
      const key = toMonthKey(row.date);
      map.set(key, (map.get(key) ?? 0) + row.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ month: k, label: monthLabel(k), amount: Math.round(v) }));
  }, [data]);

  const total = monthly.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-charcoal/10 bg-cream p-4 shadow-soft">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider2 text-charcoal/60">מתאריך</span>
          <DatePicker ariaLabel="מתאריך" value={from} onChange={setFrom} max={to || undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider2 text-charcoal/60">עד</span>
          <DatePicker ariaLabel="עד תאריך" value={to} onChange={setTo} min={from || undefined} />
        </div>
        <button
          onClick={load}
          className="h-12 rounded-full bg-charcoal px-5 text-sm text-cream hover:bg-ink"
        >
          רענן
        </button>
        <div className="ms-auto text-end">
          <p className="text-xs uppercase tracking-wider2 text-charcoal/50">סך הכנסות בטווח</p>
          <p className="font-serif text-2xl text-charcoal">{formatPrice(total)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 shadow-soft">
        <h2 className="font-serif text-lg text-charcoal">הכנסות חודשיות</h2>
        <div className="mt-4 h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-charcoal/50">טוען…</div>
          ) : monthly.length === 0 ? (
            <div className="flex h-full items-center justify-center text-charcoal/50">אין נתונים</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₪${v}`} />
                <Tooltip
                  formatter={(v) => formatPrice(Number(v) || 0)}
                  labelFormatter={(l) => String(l)}
                />
                <Bar dataKey="amount" fill="#a06b3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
