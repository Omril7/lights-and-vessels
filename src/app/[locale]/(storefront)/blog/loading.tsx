import { Skeleton } from "@/components/ui/Skeleton";

export default function BlogLoading() {
  return (
    <main className="mx-auto max-w-editorial px-5 py-12 md:px-8 md:py-20">
      <header className="mb-10 md:mb-14 text-center space-y-3">
        <Skeleton className="h-3 w-24 mx-auto" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </header>

      <div className="mb-10 flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
