import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ShopGrid } from "@/components/storefront/ShopGrid";
import { ShopFilters } from "@/components/storefront/ShopFilters";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { type SortKey } from "@/types";
import type { ProductWithImages } from "@/types";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return {
    title: t("collectionLabel"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/shop`,
      languages: { he: `/he/shop`, en: `/en/shop` },
    },
  };
}

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
  const t = await getTranslations("shop");
  const category = "";
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

  return (
    <div className="mx-auto max-w-editorial px-5 pb-10 pt-28 md:px-8 md:pt-32">
      <FadeIn className="mb-10 text-center">
        <p className="text-xs uppercase tracking-wider2 text-copper">
          {t("collectionLabel")}
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink md:text-5xl">
          {t("allItems")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/60">
          {t("subtitle")}
        </p>
      </FadeIn>

      <ShopFilters
        activeSort={sort}
        total={products.length}
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="font-serif text-2xl text-ink">
            {t("emptyCategory")}
          </p>
          <p className="max-w-sm text-sm text-charcoal/60">
            {t("emptyMessage")}
          </p>
          <Button href="/shop" variant="outline">
            {t("allItemsBtn")}
          </Button>
        </div>
      ) : (
        <ShopGrid products={products} />
      )}
    </div>
  );
}
