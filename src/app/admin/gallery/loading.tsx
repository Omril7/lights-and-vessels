import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { AdminHeaderSkeleton } from "@/components/admin/AdminSkeletons";

/** Gallery projects: title + new-project button, list with thumbnails and status. */
export default function AdminGalleryLoading() {
  return (
    <div className="space-y-6">
      <LoadingLabel />
      <AdminHeaderSkeleton titleWidth="w-28" actions={1} />
      <div className="divide-y divide-charcoal/10 border border-charcoal/10 bg-cream">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-12 w-12 shrink-0" />
            <Skeleton className={i % 2 ? "h-4 w-40" : "h-4 w-52"} />
            <Skeleton className="ms-auto h-6 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
