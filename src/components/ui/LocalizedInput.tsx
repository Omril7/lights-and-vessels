import { cn } from "@/lib/utils";
import { IsraelFlag, UsaFlag } from "@/lib/flags";

const fieldBase =
  "w-full bg-cream border border-charcoal/20 rounded-xl px-4 py-3 text-sm text-ink font-sans placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30 transition-colors";

const labelBase = "text-xs uppercase tracking-wider2 text-charcoal/70 font-medium";

export function LocalizedInput({
  label,
  locale,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  locale: "he" | "en";
}) {
  const Flag = locale === "he" ? IsraelFlag : UsaFlag;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelBase}>
        <span className="flex items-center gap-1.5">
          <Flag className="h-3 w-[1.1rem] shrink-0 rounded-[2px] shadow-sm" />
          {label}
        </span>
      </label>
      <input
        id={id}
        dir={locale === "he" ? "rtl" : "ltr"}
        className={cn(fieldBase, className)}
        {...props}
      />
    </div>
  );
}

export function LocalizedTextarea({
  label,
  locale,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  locale: "he" | "en";
}) {
  const Flag = locale === "he" ? IsraelFlag : UsaFlag;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelBase}>
        <span className="flex items-center gap-1.5">
          <Flag className="h-3 w-[1.1rem] shrink-0 rounded-[2px] shadow-sm" />
          {label}
        </span>
      </label>
      <textarea
        id={id}
        dir={locale === "he" ? "rtl" : "ltr"}
        className={cn(fieldBase, "resize-y", className)}
        {...props}
      />
    </div>
  );
}
