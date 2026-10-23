import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "תגיות מוצרים" };

export default async function ProductTagsPage() {
  const tags = await prisma.productTag.findMany({
    orderBy: { name_he: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          מוצרים
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">תגיות</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          כל תגית נשמרת פעם אחת בשתי השפות, ובעריכת מוצר בוחרים מתוך הרשימה.
        </p>
      </header>
      <TaxonomyManager
        kind="tags"
        initial={tags.map((t) => ({
          id: t.id,
          name_he: t.name_he,
          name_en: t.name_en,
          count: t._count.products,
        }))}
      />
    </div>
  );
}
