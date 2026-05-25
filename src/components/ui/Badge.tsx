import { cn } from "@/lib/utils";

type Tone = "neutral" | "sale" | "soldout" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-sand/70 text-charcoal",
  sale: "bg-terracotta text-cream",
  soldout: "bg-charcoal text-cream",
  accent: "bg-gold/20 text-copper border border-gold/40",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] tracking-wider2 font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
