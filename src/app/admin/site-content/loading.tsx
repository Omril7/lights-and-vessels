import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { AdminHeaderSkeleton } from "@/components/admin/AdminSkeletons";

/** Site pages overview: title + intro, six page cards with progress bars. */
export default function AdminSiteContentLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <LoadingLabel />
      <AdminHeaderSkeleton actions={0} />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 border border-charcoal/15 bg-cream p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <Skeleton className="mt-3 h-3 w-24" />
            <Skeleton className="h-1 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
