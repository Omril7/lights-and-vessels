/** Small language tag ("HE" / "EN") — used instead of flags next to bilingual fields. */
export function LangCode({ locale, className = "" }: { locale: "he" | "en"; className?: string }) {
  return (
    <span
      dir="ltr"
      aria-hidden
      className={`inline-flex shrink-0 items-center border border-charcoal/30 px-1 text-[0.62rem] font-semibold leading-[1.15rem] tracking-wide text-charcoal/70 ${className}`}
    >
      {locale === "he" ? "HE" : "EN"}
    </span>
  );
}
