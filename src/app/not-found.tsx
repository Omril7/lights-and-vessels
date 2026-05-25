import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-serif text-7xl text-clay">404</p>
      <h1 className="font-serif text-3xl text-ink">הדף לא נמצא</h1>
      <p className="max-w-sm text-charcoal/60">
        ייתכן שהפריט נמכר, או שהקישור השתנה. בואו נחזור לדרך הנכונה.
      </p>
      <Link
        href="/"
        className="rounded-full bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-ink"
      >
        חזרה לעמוד הבית
      </Link>
    </div>
  );
}
