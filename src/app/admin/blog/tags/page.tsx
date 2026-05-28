import { prisma } from "@/lib/prisma";
import { BlogTagManager } from "@/components/admin/BlogTagManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "תגיות בלוג" };

export default async function AdminBlogTagsPage() {
  const tags = await prisma.blogTag.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          בלוג
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">תגיות</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          ניהול התגיות שיופיעו כסינון בעמוד הבלוג.
        </p>
      </header>
      <BlogTagManager initial={tags} />
    </div>
  );
}
