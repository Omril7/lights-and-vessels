import { Skeleton } from "@/components/ui/Skeleton";

export default function StorefrontLoading() {
  return (
    <div className="mx-auto max-w-editorial px-5 pb-20 pt-28 md:px-8 md:pt-32">
      <Skeleton className="aspect-[16/9] w-full rounded-2xl md:aspect-[21/9]" />

      <div className="mt-16 space-y-6">
        <Skeleton className="mx-auto h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
