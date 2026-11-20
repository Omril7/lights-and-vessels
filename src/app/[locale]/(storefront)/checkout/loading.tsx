import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { SummarySkeleton } from "@/components/storefront/SummarySkeleton";

/** Checkout: title, contact fields, delivery options, summary box. */
export default function CheckoutLoading() {
  const field = (
    <div className="space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
  return (
    <div className="mx-auto max-w-editorial px-5 pb-20 pt-12 md:px-8 md:pt-16">
      <LoadingLabel />
      <Skeleton className="mb-10 h-11 w-40 md:h-12" />
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="grid gap-4 md:grid-cols-2">
              {field}
              {field}
            </div>
            {field}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <SummarySkeleton />
      </div>
    </div>
  );
}
