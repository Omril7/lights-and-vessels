import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { AdminHeaderSkeleton } from "@/components/admin/AdminSkeletons";

/** Page editor: back link, title + actions, language tabs, section cards with fields. */
export default function AdminSiteContentGroupLoading() {
  return (
    <div className="mx-auto max-w-3xl pb-32">
      <LoadingLabel />
      <div className="mb-6 space-y-3">
        <Skeleton className="h-3 w-28" />
        <AdminHeaderSkeleton actions={1} />
      </div>
      <div className="mb-6 flex gap-1 border-b border-charcoal/10 pb-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-6">
        {[2, 3].map((fields, s) => (
          <div key={s} className="border border-charcoal/10 bg-cream p-5 md:p-6">
            <Skeleton className="mb-5 h-6 w-36" />
            <div className="space-y-6">
              {Array.from({ length: fields }).map((_, f) => (
                <div key={f} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-56 max-w-full" />
                  <Skeleton className={f === 1 ? "h-28 w-full" : "h-11 w-full"} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
