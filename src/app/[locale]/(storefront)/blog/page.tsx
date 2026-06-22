import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/utils";
import { BlogCard } from "@/components/storefront/BlogCard";
import { BlogTagFilter } from "@/components/storefront/BlogTagFilter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("heading"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { he: `/he/blog`, en: `/en/blog` },
    },
  };
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("blog"),
  ]);
  const activeTag = searchParams.tag?.trim() || null;

  const [tags, posts] = await Promise.all([
    prisma.blogTag.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.blogPost.findMany({
      where: {
        status: "published",
        publishedAt: { lte: new Date() },
        ...(activeTag
          ? { tags: { some: { tag: { slug: activeTag } } } }
          : {}),
      },
      include: {
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-editorial px-5 py-12 md:px-8 md:py-20">
      <header className="mb-10 md:mb-14 text-center">
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          {t("studioLabel")}
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl text-charcoal">
          {t("heading")}
        </h1>
        <p className="mt-3 text-charcoal/70 max-w-xl mx-auto">
          {t("description")}
        </p>
      </header>

      <div className="mb-10 flex justify-center">
        <BlogTagFilter
          tags={tags.map((tag) => ({ name: localize(tag, "name", locale), slug: tag.slug }))}
          active={activeTag}
        />
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-charcoal/60 py-16">
          {activeTag ? t("emptyTag") : t("empty")}
        </p>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
          {posts.map((p) => (
            <BlogCard
              key={p.id}
              post={{
                slug: p.slug,
                title: localize(p, "title", locale),
                excerpt: localize(p, "excerpt", locale),
                image: p.images[0]
                  ? { url: p.images[0].url, alt: p.images[0].alt_he }
                  : null,
                author: p.author,
                publishedAt: p.publishedAt,
                tags: p.tags.map((t) => ({
                  name: localize(t.tag, "name", locale),
                  slug: t.tag.slug,
                })),
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
