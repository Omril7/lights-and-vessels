import { LoadingLabel } from "@/components/ui/Skeleton";
import { BannerSkeleton, CardGridSkeleton } from "@/components/storefront/PageSkeletons";

/** Gallery: dark banner + grid of sold pieces and projects. */
export default function GalleryLoading() {
  return (
    <>
      <LoadingLabel />
      <BannerSkeleton />
      <div className="px-5 pb-10 pt-16 sm:px-[5vw] md:pt-20">
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}
