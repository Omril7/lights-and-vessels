import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      <div className="overflow-hidden rounded-2xl border border-charcoal/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-charcoal/10 p-4 last:border-b-0"
          >
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
