import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { AdminHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeletons";

/** Products: title + actions, search/filter bar, table with thumbnails. */
export default function AdminProductsLoading() {
  return (
    <div className="space-y-6">
      <LoadingLabel />
      <AdminHeaderSkeleton titleWidth="w-36" actions={3} />
      <div className="flex flex-wrap gap-2 border border-charcoal/10 bg-cream p-3">
        <Skeleton className="h-10 min-w-[12rem] flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <AdminTableSkeleton rows={6} thumb />
    </div>
  );
}
