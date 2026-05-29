import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/ui/Markdown";
import { BlogGallery } from "@/components/storefront/BlogGallery";
import { formatDate } from "@/lib/utils";

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
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "פוסט לא נמצא" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      images: post.images[0] ? [{ url: post.images[0].url }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
      <nav className="mb-6 text-sm">
        <Link href="/blog" className="text-charcoal/60 hover:text-copper">
          ← חזרה לבלוג
        </Link>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
          {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
          <span className="text-charcoal/30">·</span>
          <span>מאת {post.author}</span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl text-charcoal leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-charcoal/75 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <li key={t.tagId}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(t.tag.slug)}`}
                  className="rounded-full border border-charcoal/15 bg-linen/60 px-3 py-1 text-xs text-charcoal/75 hover:border-charcoal/40 hover:text-charcoal"
                >
                  {t.tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="my-8 md:my-12">
        <BlogGallery
          images={post.images.map((i) => ({ url: i.url, alt: i.alt }))}
          title={post.title}
        />
      </div>

      <Markdown source={post.body} />
    </main>
  );
}
