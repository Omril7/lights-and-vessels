import { Skeleton } from "@/components/ui/Skeleton";

/** Bordered table card (header row + data rows) for the admin loading screens. */
export function AdminTableSkeleton({ rows = 6, thumb = false }: { rows?: number; thumb?: boolean }) {
  return (
    <section className="overflow-hidden border border-charcoal/10 bg-cream">
      <div className="flex items-center gap-4 border-b border-charcoal/10 bg-linen/60 px-5 py-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="ms-auto h-3 w-12" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-charcoal/5 px-5 py-3.5 last:border-b-0"
        >
          {thumb && <Skeleton className="h-12 w-12 shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className={i % 2 ? "h-4 w-1/3" : "h-4 w-1/4"} />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </section>
  );
}

/** Page title (+ optional subtitle) and action buttons row. */
export function AdminHeaderSkeleton({
  titleWidth = "w-40",
  subtitle = true,
  actions = 1,
}: {
  titleWidth?: string;
  subtitle?: boolean;
  actions?: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className={`h-9 ${titleWidth}`} />
        {subtitle && <Skeleton className="h-3 w-64 max-w-full" />}
      </div>
      {actions > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className={i === actions - 1 ? "h-9 w-28" : "h-9 w-20"} />
          ))}
        </div>
      )}
    </div>
  );
}
