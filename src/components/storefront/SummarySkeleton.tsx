import { Skeleton } from "@/components/ui/Skeleton";

/** The order-summary box shared by the cart and checkout skeletons. */
export function SummarySkeleton() {
  return (
    <aside className="h-fit border border-charcoal/15 bg-linen p-6">
      <Skeleton className="h-6 w-28" />
      <div className="mt-5 space-y-3 border-t border-charcoal/15 pt-4">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-14" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-10" />
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t border-charcoal/15 pt-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-6 h-12 w-full" />
    </aside>
  );
}
