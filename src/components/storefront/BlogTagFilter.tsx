import Link from "next/link";
import { cn } from "@/lib/utils";

export function BlogTagFilter({
  tags,
  active,
}: {
  tags: { name: string; slug: string }[];
  active: string | null;
}) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      <li>
        <Link
          href="/blog"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            active === null
              ? "border-charcoal bg-charcoal text-cream"
              : "border-charcoal/25 text-charcoal hover:border-charcoal"
          )}
        >
          הכול
        </Link>
      </li>
      {tags.map((t) => {
        const on = active === t.slug;
        return (
          <li key={t.slug}>
            <Link
              href={`/blog?tag=${encodeURIComponent(t.slug)}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                on
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-charcoal/25 text-charcoal hover:border-charcoal"
              )}
            >
              {t.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
