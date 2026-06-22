import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function BlogTagFilter({
  tags,
  active,
}: {
  tags: { name: string; slug: string }[];
  active: string | null;
}) {
  if (tags.length === 0) return null;
  const t = await getTranslations("blog");

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
          {t("filterAll")}
        </Link>
      </li>
      {tags.map((tag) => {
        const on = active === tag.slug;
        return (
          <li key={tag.slug}>
            <Link
              href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                on
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-charcoal/25 text-charcoal hover:border-charcoal"
              )}
            >
              {tag.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
