import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { AdminHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeletons";

/** Dashboard: greeting + actions, four stat cards, recent orders table. */
export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <LoadingLabel />
      <AdminHeaderSkeleton subtitle={false} actions={2} />
      <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-charcoal/10 bg-cream p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="mt-4 h-8 w-20" />
          </div>
        ))}
      </section>
      <AdminTableSkeleton rows={5} />
    </div>
  );
}
