import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { SummarySkeleton } from "@/components/storefront/SummarySkeleton";

/** Cart: title, item rows (thumbnail, name, quantity), summary box. */
export default function CartLoading() {
  return (
    <div className="mx-auto max-w-editorial px-5 pb-16 pt-12 md:px-8 md:pt-16">
      <LoadingLabel />
      <Skeleton className="mb-10 h-11 w-52 md:h-12" />
      <div className="grid gap-10 lg:grid-cols-3">
        <ul className="divide-y divide-charcoal/10 lg:col-span-2">
          {[0, 1].map((i) => (
            <li key={i} className="flex gap-5 py-6">
              <Skeleton className="h-32 w-28 shrink-0" />
              <div className="flex flex-1 flex-col gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-auto h-10 w-28" />
              </div>
            </li>
          ))}
        </ul>
        <SummarySkeleton />
      </div>
    </div>
  );
}
