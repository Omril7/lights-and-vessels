import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { LinesSkeleton } from "@/components/storefront/PageSkeletons";

/** Fallback for storefront pages without their own skeleton: title + text column. */
export default function StorefrontLoading() {
  return (
    <div className="paper-grain px-5 pb-16 pt-12 sm:px-[5vw] md:pt-16">
      <LoadingLabel />
      <div className="mx-auto w-[min(46rem,100%)]">
        <Skeleton className="h-11 w-2/3 md:h-12" />
        <LinesSkeleton lines={2} className="mt-6 max-w-xl" />
        <div className="mt-10 space-y-8 border-t border-stone pt-8">
          <LinesSkeleton lines={4} />
          <LinesSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}
