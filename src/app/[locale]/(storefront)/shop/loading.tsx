import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { BannerSkeleton, CardGridSkeleton } from "@/components/storefront/PageSkeletons";

/** Store: dark banner, category filter buttons, card grid. */
export default function StoreLoading() {
  return (
    <>
      <LoadingLabel />
      <BannerSkeleton />
      <div className="flex flex-col gap-12 px-5 pb-10 pt-16 sm:px-[5vw] md:pt-20">
        <div className="flex flex-wrap justify-end gap-2">
          {["w-14", "w-16", "w-20", "w-20", "w-20"].map((w, i) => (
            <Skeleton key={i} className={`h-11 ${w}`} />
          ))}
        </div>
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}
