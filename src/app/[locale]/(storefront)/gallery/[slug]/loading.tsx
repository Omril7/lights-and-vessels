import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { LinesSkeleton } from "@/components/storefront/PageSkeletons";

/** Gallery project: centred title + year, text, photos in one column. */
export default function GalleryProjectLoading() {
  return (
    <div className="paper-grain px-5 pb-10 pt-12 sm:px-[5vw]">
      <LoadingLabel />
      <div className="mx-auto flex w-[min(720px,100%)] flex-col gap-10">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-12 w-64 max-w-full" />
          <Skeleton className="h-4 w-12" />
        </div>
        <LinesSkeleton lines={4} />
        <Skeleton className="aspect-[4/5] w-full" />
      </div>
    </div>
  );
}
