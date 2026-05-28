import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/storefront/BlogCard";
import { BlogTagFilter } from "@/components/storefront/BlogTagFilter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "בלוג",
  description: "מחשבות, השראות וסיפורים מהסטודיו.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
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
      include: { tags: { include: { tag: true } } },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-editorial px-5 py-12 md:px-8 md:py-20">
      <header className="mb-10 md:mb-14 text-center">
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          הסטודיו
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl text-charcoal">
          בלוג
        </h1>
        <p className="mt-3 text-charcoal/70 max-w-xl mx-auto">
          מחשבות, השראות וסיפורים מהסטודיו.
        </p>
      </header>

      <div className="mb-10 flex justify-center">
        <BlogTagFilter
          tags={tags.map((t) => ({ name: t.name, slug: t.slug }))}
          active={activeTag}
        />
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-charcoal/60 py-16">
          עדיין אין פוסטים{activeTag ? " לתגית הזו" : ""}.
        </p>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
          {posts.map((p) => (
            <BlogCard
              key={p.id}
              post={{
                slug: p.slug,
                title: p.title,
                excerpt: p.excerpt,
                coverImage: p.coverImage,
                coverAlt: p.coverAlt,
                author: p.author,
                publishedAt: p.publishedAt,
                tags: p.tags.map((t) => ({
                  name: t.tag.name,
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
