import { cn } from "@/lib/utils";

/**
 * Placeholder block with a soft shimmer. `tone="dark"` is for skeletons on the
 * dark sections (entry page, photo banners). The shimmer is skipped for
 * visitors who prefer reduced motion.
 */
export function Skeleton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden",
        tone === "dark" ? "bg-white/[0.07]" : "bg-sand/70",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:to-transparent motion-reduce:before:hidden",
        tone === "dark" ? "before:via-white/[0.06]" : "before:via-cream/70",
        className
      )}
    />
  );
}

/** Screen-reader announcement for a loading page (visually hidden). */
export function LoadingLabel({ text = "טוען… · Loading…" }: { text?: string }) {
  return (
    <p role="status" className="sr-only">
      {text}
    </p>
  );
}
