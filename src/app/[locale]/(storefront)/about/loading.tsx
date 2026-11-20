import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";
import { LinesSkeleton } from "@/components/storefront/PageSkeletons";

/** About: large opening statement, two lists side by side, the story column. */
export default function AboutLoading() {
  return (
    <div className="pt-12 md:pt-16">
      <LoadingLabel />
      <section className="mx-auto max-w-editorial px-5 md:px-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-5 flex max-w-4xl flex-col gap-3.5">
          <Skeleton className="h-9 w-full md:h-11" />
          <Skeleton className="h-9 w-11/12 md:h-11" />
          <Skeleton className="h-9 w-3/5 md:h-11" />
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-editorial gap-14 px-5 md:mt-32 md:grid-cols-2 md:gap-16 md:px-8">
        {[0, 1].map((col) => (
          <div key={col}>
            <Skeleton className="h-4 w-20" />
            <div className="mt-4 border-b border-stone">
              {[0, 1, 2].map((r) => (
                <div key={r} className="border-t border-stone py-4">
                  <Skeleton className={r === 1 ? "h-5 w-40" : "h-5 w-52"} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-24 max-w-2xl space-y-8 px-5 pb-16 md:mt-32 md:px-8">
        <LinesSkeleton lines={4} />
        <LinesSkeleton lines={5} />
      </section>
    </div>
  );
}
