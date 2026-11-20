import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Building blocks for the storefront loading.tsx files — each mirrors the
 * real component's layout, spacing and colours so the page doesn't jump when
 * it loads.
 */

/** Dark photo banner with the title in the bottom corner (store, gallery). */
export function BannerSkeleton() {
  return (
    <section className="on-dark relative h-[clamp(320px,52vh,560px)] overflow-hidden bg-[#1c1612]">
      <div className="absolute inset-x-5 bottom-10 flex flex-col gap-3 sm:inset-x-[5vw] sm:bottom-12">
        <Skeleton tone="dark" className="h-12 w-44 md:h-14" />
        <Skeleton tone="dark" className="h-4 w-56" />
      </div>
    </section>
  );
}

/** One store-style card: 4:5 photo, hairline, name + price, spec line. */
export function CardSkeleton({ i = 0 }: { i?: number }) {
  return (
    <div className="flex flex-col gap-3.5">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="flex items-baseline justify-between gap-3 border-t border-stone pt-3">
        <Skeleton className={i % 2 ? "h-4 w-24" : "h-4 w-32"} />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className={i % 3 === 1 ? "-mt-1 h-3 w-40" : "-mt-1 h-3 w-28"} />
    </div>
  );
}

/** The store / gallery grid. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-8 gap-y-16">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} i={i} />
      ))}
    </div>
  );
}

/** Paragraph placeholder: n lines, the last one shorter. */
export function LinesSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "h-3.5 w-2/3" : "h-3.5 w-full"} />
      ))}
    </div>
  );
}
