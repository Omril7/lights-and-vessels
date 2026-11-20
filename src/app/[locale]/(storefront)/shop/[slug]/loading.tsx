import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { LinesSkeleton } from "@/components/storefront/PageSkeletons";

/** Product: centred square photo, thumbnails, name, spec line, stamp buttons. */
export default function ProductLoading() {
  return (
    <div className="paper-grain px-5 pb-10 pt-8 sm:px-[5vw]">
      <LoadingLabel />
      <div className="mx-auto flex w-[min(480px,100%)] flex-col gap-3">
        <Skeleton className="aspect-square w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-14 w-14" />
          <Skeleton className="h-14 w-14" />
        </div>
        <div className="flex flex-col items-center gap-2.5 pb-0.5 pt-1.5">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        {/* stamp outlines in the stamp colour, faded */}
        <div className="h-[72px] w-full border-2 border-stamp/25" />
        <div className="flex gap-2.5">
          <div className="h-11 flex-1 border-[1.5px] border-stamp/25" />
          <div className="h-11 flex-1 border-[1.5px] border-stamp/25" />
        </div>
        <LinesSkeleton lines={4} className="mt-10" />
      </div>
    </div>
  );
}
