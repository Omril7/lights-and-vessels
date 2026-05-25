"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function retry() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.redirectUrl) {
        throw new Error(data?.error || "תקלה");
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "תקלה ביצירת תשלום");
      setLoading(false);
    }
  }

  return (
    <Button onClick={retry} disabled={loading} size="lg">
      {loading ? "טוען…" : "נסה שוב"}
    </Button>
  );
}
