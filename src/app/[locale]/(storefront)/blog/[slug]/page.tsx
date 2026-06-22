import type { Metadata } from "next";
import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/ui/Markdown";
import { BlogGallery } from "@/components/storefront/BlogGallery";
import { formatDate, localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

const getPost = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
    },
  });
  if (
    !post ||
    post.status !== "published" ||
    !post.publishedAt ||
    post.publishedAt > new Date()
  ) {
    return null;
  }
  return post;
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  const post = await getPost(slug);
  if (!post) return { title: locale === "en" ? "Post not found" : "פוסט לא נמצא" };
  const title = localize(post, "title", locale);
  const description = localize(post, "excerpt", locale) || undefined;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog/${post.slug}`,
      languages: { he: `/he/blog/${post.slug}`, en: `/en/blog/${post.slug}` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "en" ? "en_US" : "he_IL",
      images: post.images[0] ? [{ url: post.images[0].url }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const [post, locale, t] = await Promise.all([
    getPost(params.slug),
    getLocale(),
    getTranslations("blog"),
  ]);
  if (!post) notFound();

  const title = localize(post, "title", locale);
  const excerpt = localize(post, "excerpt", locale);
  const body = localize(post, "body", locale);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
      <nav className="mb-6 text-sm">
        <Link href="/blog" className="text-charcoal/60 hover:text-copper">
          {t("back")}
        </Link>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
          {post.publishedAt && <time>{formatDate(post.publishedAt, locale)}</time>}
          <span className="text-charcoal/30">·</span>
          <span>{t("by", { author: post.author })}</span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl text-charcoal leading-tight">
          {title}
        </h1>
        {excerpt && (
          <p className="text-lg text-charcoal/75 leading-relaxed">
            {excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((pt) => (
              <li key={pt.tagId}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(pt.tag.slug)}`}
                  className="rounded-full border border-charcoal/15 bg-linen/60 px-3 py-1 text-xs text-charcoal/75 hover:border-charcoal/40 hover:text-charcoal"
                >
                  {localize(pt.tag, "name", locale)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="my-8 md:my-12">
        <BlogGallery
          images={post.images.map((i) => ({
            url: i.url,
            alt: (locale !== "he" ? i.alt_en : null) ?? i.alt_he ?? null,
          }))}
          title={title}
        />
      </div>

      <Markdown source={body} />
    </main>
  );
}
