"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

/** Moves one product a step up or down within the ids currently on screen. */
export function ProductReorderButtons({
  ids,
  index,
}: {
  ids: string[];
  index: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function move(delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];

    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("שגיאה בשינוי הסדר");
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "rounded p-0.5 text-charcoal/50 hover:bg-charcoal/[0.08] hover:text-charcoal disabled:opacity-25 disabled:hover:bg-transparent";
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={busy || index === 0}
        aria-label="הזזה למעלה"
        className={btn}
      >
        <ChevronUpIcon className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={busy || index === ids.length - 1}
        aria-label="הזזה למטה"
        className={btn}
      >
        <ChevronDownIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
