import { Skeleton, LoadingLabel } from "@/components/ui/Skeleton";

/** Entry page: the dark full-screen frame with the corner texts and three doors. */
export default function EntryLoading() {
  return (
    <div className="on-dark relative min-h-[100svh] overflow-hidden bg-[#1c1612]">
      <LoadingLabel />
      <div className="grid min-h-[100svh] grid-rows-[auto_1fr_auto] gap-8 px-5 pb-10 pt-8 sm:px-[5vw]">
        <div className="flex items-start justify-between gap-5">
          <Skeleton tone="dark" className="h-4 w-28" />
          <Skeleton tone="dark" className="h-3 w-56" />
        </div>
        <div />
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-4">
            <Skeleton tone="dark" className="h-24 w-[clamp(200px,22vw,320px)]" />
            <Skeleton tone="dark" className="h-5 w-64" />
          </div>
          <div className="flex flex-col items-end gap-3">
            <Skeleton tone="dark" className="h-9 w-28" />
            <Skeleton tone="dark" className="h-9 w-32" />
            <Skeleton tone="dark" className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
