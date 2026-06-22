import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/BlogForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "עריכת פוסט" };

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const [post, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.blogTag.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, name_he: true },
    }),
  ]);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">בלוג</p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">{post.title_he}</h1>
      </header>
      <BlogForm
        mode="edit"
        tags={tags.map((t) => ({ id: t.id, name: t.name_he }))}
        initial={{
          id: post.id,
          title_he: post.title_he,
          title_en: post.title_en ?? "",
          slug: post.slug,
          excerpt_he: post.excerpt_he,
          excerpt_en: post.excerpt_en ?? "",
          body_he: post.body_he,
          body_en: post.body_en ?? "",
          images: post.images.map((i) => ({ url: i.url, alt: i.alt_he })),
          author: post.author,
          status: post.status === "published" ? "published" : "draft",
          publishedAt: toLocalInput(post.publishedAt),
          tagIds: post.tags.map((t) => t.tagId),
        }}
      />
    </div>
  );
}
