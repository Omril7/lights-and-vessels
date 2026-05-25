import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ShopGrid } from "@/components/storefront/ShopGrid";
import { ShopFilters } from "@/components/storefront/ShopFilters";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, categoryLabel, type SortKey } from "@/types";
import type { ProductWithImages } from "@/types";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "החנות",
  description: "אוסף התכשיטים וחפצי הבית של הסטודיו.",
};

const SORT_MAP: Record<SortKey, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  const category =
    searchParams.category &&
    CATEGORIES.some((c) => c.slug === searchParams.category)
      ? searchParams.category
      : "";
  const sort: SortKey = (
    ["newest", "price-asc", "price-desc"] as const
  ).includes(searchParams.sort as SortKey)
    ? (searchParams.sort as SortKey)
    : "newest";

  const products = (await prisma.product.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: SORT_MAP[sort],
  })) as ProductWithImages[];

  // Hide the category filter UI until at least one product has been categorized.
  const hasAnyCategorized =
    (await prisma.product.count({
      where: { published: true, category: { not: null } },
    })) > 0;

  return (
    <div className="mx-auto max-w-editorial px-5 pb-10 pt-28 md:px-8 md:pt-32">
      <FadeIn className="mb-10 text-center">
        <p className="text-xs uppercase tracking-wider2 text-copper">
          האוסף
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink md:text-5xl">
          {category ? categoryLabel(category) : "כל הפריטים"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/60">
          כל פריט נוצר בעבודת יד בסטודיו, במנות קטנות.
        </p>
      </FadeIn>

      <ShopFilters
        activeCategory={category}
        activeSort={sort}
        total={products.length}
        showCategoryFilter={hasAnyCategorized}
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="font-serif text-2xl text-ink">
            אין פריטים בקטגוריה הזו
          </p>
          <p className="max-w-sm text-sm text-charcoal/60">
            נסו קטגוריה אחרת, או חזרו לכל האוסף.
          </p>
          <Button href="/shop" variant="outline">
            לכל הפריטים
          </Button>
        </div>
      ) : (
        <ShopGrid products={products} />
      )}
    </div>
  );
}
