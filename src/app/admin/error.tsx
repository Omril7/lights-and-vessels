"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-10 text-center">
      <h1 className="font-serif text-2xl text-charcoal">שגיאה בטעינת הדף</h1>
      <p className="max-w-md text-sm text-charcoal/70">
        משהו השתבש. בדקו את הקונסול לפרטים, ונסו שוב.
      </p>
      <pre
        className="max-w-full overflow-auto rounded-lg bg-charcoal/[0.06] px-3 py-2 text-start text-xs text-charcoal/70"
        dir="ltr"
      >
        {error.message}
      </pre>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>נסו שוב</Button>
        <Link
          href="/admin"
          className="rounded-full border border-charcoal/20 px-5 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/[0.06]"
        >
          חזרה לדשבורד
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-charcoal/40" dir="ltr">
          ref: {error.digest}
        </p>
      )}
    </div>
  );
}
