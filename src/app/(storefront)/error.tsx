"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StorefrontError({
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
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-5 pt-28 text-center">
      <p className="font-serif text-6xl text-charcoal/30">!</p>
      <h1 className="font-serif text-3xl text-ink">משהו השתבש</h1>
      <p className="text-sm text-charcoal/70">
        אירעה שגיאה בטעינת הדף. נסו שוב, או חזרו לדף הבית.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>נסו שוב</Button>
        <Link
          href="/"
          className="rounded-full border border-charcoal/20 px-5 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/[0.06]"
        >
          חזרה לדף הבית
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-charcoal/40" dir="ltr">
          ref: {error.digest}
        </p>
      )}
    </div>
  );
}
