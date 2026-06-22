"use client";

import { Button, Dropdown } from "@/components/ui";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function OrderControls({
  id,
  initialStatus,
  initialNotes,
}: {
  id: string;
  initialStatus: OrderStatus;
  initialNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [releasing, setReleasing] = useState(false);

  async function releaseReservation() {
    if (!confirm("לשחרר את המלאי שמור להזמנה זו ולסמן אותה כמבוטלת?")) return;
    setReleasing(true);
    try {
      const res = await fetch(`/api/orders/${id}/release`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "שגיאה בשחרור המלאי");
      }
      toast.success("המלאי שוחרר וההזמנה בוטלה");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setReleasing(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("שגיאה בעדכון");
      toast.success("ההזמנה עודכנה");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="status"
          className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium"
        >
          סטטוס
        </label>
        <Dropdown
          id="status"
          ariaLabel="סטטוס הזמנה"
          variant="field"
          value={status}
          onChange={(v) => setStatus(v as OrderStatus)}
          options={ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium"
        >
          הערות פנימיות
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="הערות לעצמך…"
          className="w-full rounded-xl border border-charcoal/20 bg-cream p-3 text-sm focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <Button onClick={save} disabled={saving} className="w-full" size="sm">
        {saving ? "שומר…" : "שמירת שינויים"}
      </Button>

      {initialStatus === "pending" && (
        <div className="pt-3 border-t border-charcoal/10">
          <p className="text-xs text-charcoal/60 mb-2">
            הזמנה זו מחזיקה רזרבת מלאי. שחרר כדי להחזיר את היחידות לחנות ולסמן את ההזמנה כמבוטלת.
          </p>
          <Button
            onClick={releaseReservation}
            disabled={releasing}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            {releasing ? "משחרר…" : "שחרור רזרבת מלאי"}
          </Button>
        </div>
      )}
    </div>
  );
}
