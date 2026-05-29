import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, renderMarkdown } from "@/lib/utils";
import { categoryLabel } from "@/types";
import type { ProductWithImages } from "@/types";

export const dynamic = "force-dynamic";

const getProduct = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" } } },
  }),
);

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "פריט לא נמצא" };
  const description = product.description.replace(/[#*\n]/g, " ").slice(0, 150);
  const firstImage = product.images[0]?.url;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/shop/${product.slug}`,
      images: firstImage ? [{ url: firstImage, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = (await getProduct(params.slug)) as ProductWithImages | null;
  if (!product) notFound();

  const related = (await prisma.product.findMany({
    where: {
      published: true,
      category: product.category,
      id: { not: product.id },
    },
    include: { images: { orderBy: { order: "asc" } } },
    take: 4,
  })) as ProductWithImages[];

  const onSale =
    product.comparePrice != null && product.comparePrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;
  const lowStock = !soldOut && product.stockCount <= 5;
  const tags = product.tags
    ? product.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.replace(/[#*\n]/g, " ").slice(0, 300),
    image: product.images.map((i) => i.url),
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "ILS",
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `/shop/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-editorial px-5 pb-10 pt-28 md:px-8 md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-charcoal/50">
        <Link href="/" className="hover:text-charcoal">
          בית
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-charcoal">
          החנות
        </Link>
        <span>/</span>
        {product.category && (
          <Link
            href={`/shop?category=${product.category}`}
            className="hover:text-charcoal"
          >
            {categoryLabel(product.category)}
          </Link>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <ProductGallery images={product.images} name={product.name} />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="lg:sticky lg:top-28">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge tone="accent">{categoryLabel(product.category)}</Badge>
              )}
              {soldOut && <Badge tone="soldout">אזל מהמלאי</Badge>}
              {onSale && !soldOut && <Badge tone="sale">במבצע</Badge>}
            </div>

            <h1 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl text-ink">
                {formatPrice(product.price)}
              </span>
              {onSale && (
                <span className="text-lg text-charcoal/40 line-through">
                  {formatPrice(product.comparePrice!)}
                </span>
              )}
            </div>

            <div className="mt-2 text-sm">
              {soldOut ? (
                <span className="text-terracotta">אזל מהמלאי כרגע</span>
              ) : lowStock ? (
                <span className="text-copper">
                  נותרו {product.stockCount} יחידות בלבד
                </span>
              ) : (
                <span className="text-olive">במלאי · מוכן למשלוח</span>
              )}
            </div>

            <div
              className="prose-art mt-6 text-[0.95rem] text-charcoal/85"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(product.description),
              }}
            />

            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton product={product} withQuantity />
            </div>

            <ul className="mt-8 space-y-2 border-t border-charcoal/10 pt-6 text-sm text-charcoal/70">
              <li>· נוצר בעבודת יד בסטודיו</li>
              <li>· משלוח עטוף בקפידה תוך 3–5 ימי עסקים</li>
              <li>· מתנה? נשמח לצרף פתק כתוב ביד</li>
            </ul>
          </div>
        </FadeIn>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <FadeIn className="mb-8">
            <h2 className="font-serif text-2xl text-ink md:text-3xl">
              עוד מאותו עולם
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.06}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
