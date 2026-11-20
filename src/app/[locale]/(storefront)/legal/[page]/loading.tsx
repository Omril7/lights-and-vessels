import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { LinesSkeleton } from "@/components/storefront/PageSkeletons";

/** Legal document: document switcher, title + date, hairline sections. */
export default function LegalLoading() {
  return (
    <div className="paper-grain px-5 pb-16 pt-10 sm:px-[5vw] md:pt-14">
      <LoadingLabel />
      <div className="mx-auto w-[min(46rem,100%)]">
        <div className="flex flex-wrap gap-2">
          {["w-16", "w-20", "w-28", "w-16", "w-20"].map((w, i) => (
            <Skeleton key={i} className={`h-10 ${w}`} />
          ))}
        </div>
        <div className="mt-12 border-b border-stone pb-8">
          <Skeleton className="h-11 w-2/3 md:h-12" />
          <Skeleton className="mt-4 h-3 w-36" />
          <LinesSkeleton lines={2} className="mt-6" />
        </div>
        {[3, 4, 3].map((n, i) => (
          <div key={i} className="border-b border-stone py-8">
            <Skeleton className="mb-5 h-6 w-40" />
            <LinesSkeleton lines={n} />
          </div>
        ))}
      </div>
    </div>
  );
}
