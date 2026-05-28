import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "בלוג" };

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
            ניהול
          </p>
          <h1 className="mt-1 font-serif text-3xl text-charcoal">בלוג</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {posts.length} פוסטים
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/blog/tags" size="sm" variant="outline">
            תגיות
          </Button>
          <Button href="/admin/blog/new" size="sm">
            <PlusIcon className="h-4 w-4" /> פוסט חדש
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        {posts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-charcoal/50">
            אין עדיין פוסטים.{" "}
            <Link href="/admin/blog/new" className="text-copper hover:underline">
              לכתוב את הראשון
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-charcoal/5">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-linen">
                  {p.coverImage && (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/blog/${p.id}/edit`}
                    className="font-medium text-charcoal hover:text-copper"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-charcoal/50" dir="ltr">
                    /{p.slug}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {p.status === "published" ? (
                      <Badge tone="neutral">מפורסם</Badge>
                    ) : (
                      <Badge tone="accent">טיוטה</Badge>
                    )}
                    {p.tags.map((t) => (
                      <span
                        key={t.tagId}
                        className="rounded-full bg-linen/80 px-2 py-0.5 text-[0.65rem] text-charcoal/70"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-charcoal/50">
                  {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                </div>
                <Link
                  href={`/admin/blog/${p.id}/edit`}
                  className="inline-flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
                >
                  <PencilSquareIcon className="h-4 w-4" /> עריכה
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
