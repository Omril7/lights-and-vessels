import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string;
  image: { url: string; alt: string | null } | null;
  author: string;
  publishedAt: Date | null;
  tags: { name: string; slug: string }[];
};

export async function BlogCard({ post }: { post: BlogCardData }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("blog")]);

  return (
    <article className="group overflow-hidden rounded-2xl border border-charcoal/10 bg-cream shadow-soft transition hover:shadow-lift">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] bg-linen">
          {post.image && (
            <Image
              src={post.image.url}
              alt={post.image.alt || post.title}
              fill
              className="object-cover transition-transform duration-700 ease-grace group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 700px"
            />
          )}
        </div>
      </Link>
      <div className="p-6 md:p-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
          {post.publishedAt && <time>{formatDate(post.publishedAt, locale)}</time>}
          <span className="text-charcoal/30">·</span>
          <span>{t("by", { author: post.author })}</span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal hover:text-copper transition-colors">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-charcoal/75 leading-relaxed">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(t.slug)}`}
                  className="rounded-full border border-charcoal/15 bg-linen/60 px-3 py-1 text-xs text-charcoal/75 hover:border-charcoal/40 hover:text-charcoal"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
