import { cn } from "@/lib/utils";

const fieldBase =
  "w-full bg-cream border border-charcoal/20 rounded-xl px-4 py-3 text-sm text-ink font-sans placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30 transition-colors";

const labelBase =
  "text-xs uppercase tracking-wider2 text-charcoal/70 font-medium";

export function Input({
  label,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className={labelBase}>
          {label}
        </label>
      )}
      <input id={id} className={cn(fieldBase, className)} {...props} />
    </div>
  );
}
