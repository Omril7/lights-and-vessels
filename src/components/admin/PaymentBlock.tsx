"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";

type Props = {
  orderId: string;
  total: number;
  paidAt: Date | string | null;
  documentNumber: string | null;
  documentUrl: string | null;
  customerEmail: string;
  status: string;
};

export function PaymentBlock({
  orderId,
  total,
  paidAt,
  documentNumber,
  documentUrl,
  customerEmail,
  status,
}: Props) {
  const [resending, setResending] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const [refunding, setRefunding] = useState(false);

  const canRefund = !!paidAt && status !== "refunded" && status !== "cancelled";

  async function resendDocument() {
    if (resending) return;
    setResending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-document`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "תקלה");
      toast.success(`המסמך נשלח אל ${customerEmail}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "תקלה בשליחה");
    } finally {
      setResending(false);
    }
  }

  async function submitRefund(fullAmount: boolean) {
    if (refunding) return;
    const body: { amount?: number } = {};
    if (!fullAmount) {
      const n = Number(partialAmount);
      if (!isFinite(n) || n <= 0) {
        toast.error("נא להזין סכום חוקי");
        return;
      }
      if (n > total) {
        toast.error("הסכום גדול מסכום ההזמנה");
        return;
      }
      body.amount = n;
    }

    if (!confirm(fullAmount ? "להוציא זיכוי מלא?" : `להוציא זיכוי בסך ${formatPrice(Number(partialAmount))}?`)) {
      return;
    }

    setRefunding(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "תקלה");
      toast.success(data.full ? "זיכוי מלא בוצע" : "זיכוי חלקי בוצע");
      setShowRefund(false);
      setPartialAmount("");
      // Refresh to pick up status change.
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "תקלה בהוצאת זיכוי");
    } finally {
      setRefunding(false);
    }
  }

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 shadow-soft">
      <h2 className="font-serif text-lg text-charcoal">תשלום</h2>

      {!paidAt ? (
        <p className="mt-3 text-sm text-charcoal/60">טרם שולמה.</p>
      ) : (
        <>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">סכום ששולם</dt>
              <dd className="text-charcoal">{formatPrice(total)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">שולם ב־</dt>
              <dd className="text-charcoal">{formatDate(paidAt)}</dd>
            </div>
            {documentNumber && (
              <div>
                <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">מספר מסמך</dt>
                <dd className="text-charcoal" dir="ltr">{documentNumber}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            {documentUrl && (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-charcoal/30 px-4 py-2 text-sm text-charcoal hover:border-charcoal"
              >
                הורד PDF
              </a>
            )}
            <button
              onClick={resendDocument}
              disabled={resending}
              className="rounded-full border border-charcoal/30 px-4 py-2 text-sm text-charcoal hover:border-charcoal disabled:opacity-50"
            >
              {resending ? "שולח…" : "שלח במייל מחדש"}
            </button>
            {canRefund && (
              <button
                onClick={() => setShowRefund((v) => !v)}
                className="rounded-full border border-terracotta/40 px-4 py-2 text-sm text-terracotta hover:border-terracotta"
              >
                החזר כספי
              </button>
            )}
          </div>

          {showRefund && canRefund && (
            <div className="mt-4 rounded-xl border border-terracotta/30 bg-linen p-4">
              <p className="text-sm text-charcoal">סכום ההזמנה: {formatPrice(total)}</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="uppercase tracking-wider2 text-charcoal/70">סכום זיכוי חלקי (₪)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={total}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    className="w-40 rounded-lg border border-charcoal/25 bg-cream px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </label>
                <Button
                  onClick={() => submitRefund(false)}
                  disabled={refunding || !partialAmount}
                  variant="outline"
                  size="sm"
                >
                  זיכוי חלקי
                </Button>
                <Button
                  onClick={() => submitRefund(true)}
                  disabled={refunding}
                  size="sm"
                >
                  זיכוי מלא
                </Button>
              </div>
              <p className="mt-3 text-xs text-charcoal/50">
                הזיכוי יונפק כחשבונית זיכוי במורנינג ויישלח במייל ללקוח.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
