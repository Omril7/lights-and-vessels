import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "קטגוריות מוצרים" };

export default async function ProductCategoriesPage() {
  const [categories, counts] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const countBySlug = new Map(counts.map((c) => [c.category, c._count._all]));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          מוצרים
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">קטגוריות</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          הוספה, שינוי שם ומחיקה של קטגוריות. כל קטגוריה דורשת שם בעברית ובאנגלית.
        </p>
      </header>
      <TaxonomyManager
        kind="categories"
        initial={categories.map((c) => ({
          id: c.id,
          name_he: c.name_he,
          name_en: c.name_en,
          count: countBySlug.get(c.slug) ?? 0,
        }))}
      />
    </div>
  );
}
