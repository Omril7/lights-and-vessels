import { cn } from "@/lib/utils";
import { LangCode } from "./LangCode";

const fieldBase =
  "w-full bg-cream border border-charcoal/35 px-4 py-3 text-sm text-ink font-sans placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30 transition-colors";

const labelBase = "text-xs text-charcoal/70 font-medium";

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
  return (
    <div className="flex flex-col gap-1.5" dir={locale === "en" ? "ltr" : undefined}>
      <label htmlFor={id} className={labelBase}>
        <span className="flex items-center gap-1.5">
          <LangCode locale={locale} />
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
  return (
    <div className="flex flex-col gap-1.5" dir={locale === "en" ? "ltr" : undefined}>
      <label htmlFor={id} className={labelBase}>
        <span className="flex items-center gap-1.5">
          <LangCode locale={locale} />
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
