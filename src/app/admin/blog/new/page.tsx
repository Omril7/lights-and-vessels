import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/BlogForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "פוסט חדש" };

export default async function NewBlogPostPage() {
  const tags = await prisma.blogTag.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name_he: true },
  });
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">בלוג</p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">פוסט חדש</h1>
      </header>
      <BlogForm mode="create" tags={tags.map((t) => ({ id: t.id, name: t.name_he }))} />
    </div>
  );
}
