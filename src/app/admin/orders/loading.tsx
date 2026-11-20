import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { AdminHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeletons";

/** Orders: title, status filters, orders table. */
export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6">
      <LoadingLabel />
      <AdminHeaderSkeleton titleWidth="w-32" subtitle={false} actions={0} />
      <div className="flex flex-wrap gap-2">
        {["w-16", "w-20", "w-24", "w-20", "w-16"].map((w, i) => (
          <Skeleton key={i} className={`h-9 ${w}`} />
        ))}
      </div>
      <AdminTableSkeleton rows={7} />
    </div>
  );
}
