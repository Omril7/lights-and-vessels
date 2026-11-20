import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "גלריה" };

export default async function AdminGalleryPage() {
  const [projects, soldCount] = await Promise.all([
    prisma.galleryProject.findMany({
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    }),
    prisma.product.count({ where: { status: "SOLD" } }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">גלריה</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            פרויקטים והזמנות מיוחדות. בנוסף, {soldCount} מוצרים שנמכרו מוצגים בגלריה אוטומטית
            (סטטוס &quot;נמכר&quot; בעריכת מוצר).
          </p>
        </div>
        <Button href="/admin/gallery/new">פרויקט חדש</Button>
      </header>

      {projects.length === 0 ? (
        <p className="border border-charcoal/10 bg-cream p-8 text-center text-sm text-charcoal/60">
          אין עדיין פרויקטים.
        </p>
      ) : (
        <ul className="divide-y divide-charcoal/10 border border-charcoal/10 bg-cream">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-linen">
                {p.images[0] && (
                  <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                )}
              </div>
              <Link
                href={`/admin/gallery/${p.id}/edit`}
                className="flex-1 font-medium text-charcoal hover:text-copper"
              >
                {p.title_he}
                {p.year && <span className="text-charcoal/50"> · {p.year}</span>}
              </Link>
              <Badge tone={p.published ? "neutral" : "accent"}>
                {p.published ? "מוצג" : "טיוטה"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
