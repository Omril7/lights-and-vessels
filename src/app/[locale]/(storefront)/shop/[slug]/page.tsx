import type { Metadata } from "next";
import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, renderMarkdown, localize } from "@/lib/utils";
import type { ProductWithImages } from "@/types";

export const dynamic = "force-dynamic";

const getProduct = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      images: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  }),
);

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  const product = await getProduct(slug);
  if (!product) return { title: locale === "en" ? "Item not found" : "פריט לא נמצא" };
  const name = localize(product, "name", locale);
  const rawDesc = localize(product, "description", locale);
  const description = rawDesc.replace(/[#*\n]/g, " ").slice(0, 150);
  const firstImage = product.images[0]?.url;
  return {
    title: name,
    description,
    alternates: {
      canonical: `/${locale}/shop/${product.slug}`,
      languages: { he: `/he/shop/${product.slug}`, en: `/en/shop/${product.slug}` },
    },
    openGraph: {
      type: "website",
      title: name,
      description,
      url: `/${locale}/shop/${product.slug}`,
      locale: locale === "en" ? "en_US" : "he_IL",
      images: firstImage ? [{ url: firstImage, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const [product, locale, t] = await Promise.all([
    getProduct(params.slug),
    getLocale(),
    getTranslations("product"),
  ]);
  if (!product) notFound();

  const related = (await prisma.product.findMany({
    where: {
      published: true,
      category: product.category,
      id: { not: product.id },
    },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 4,
  })) as ProductWithImages[];

  const name = localize(product, "name", locale);
  const description = localize(product, "description", locale);
  const materials = localize(product, "materials", locale);
  const onSale = product.comparePrice != null && product.comparePrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;
  const lowStock = !soldOut && product.stockCount <= 5;
  const tags = product.tags.map((l) => localize(l.tag, "name", locale));
  const dimensions = [product.width, product.height, product.depth]
    .filter((d): d is number => d != null)
    .join(" × ");

  const category = product.category
    ? await prisma.productCategory.findUnique({
        where: { slug: product.category },
      })
    : null;
  const catLabel = category ? localize(category, "name", locale) : "";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description.replace(/[#*\n]/g, " ").slice(0, 300),
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
          {t("breadcrumbHome")}
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-charcoal">
          {t("breadcrumbShop")}
        </Link>
        <span>/</span>
        {category && (
          <Link
            href={`/shop?category=${product.category}`}
            className="hover:text-charcoal"
          >
            {catLabel}
          </Link>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <ProductGallery images={product.images} name={name} />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="lg:sticky lg:top-28">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Badge tone="accent">{catLabel}</Badge>
              )}
              {soldOut && <Badge tone="soldout">{t("soldOut")}</Badge>}
              {onSale && !soldOut && <Badge tone="sale">{t("sale")}</Badge>}
            </div>

            <h1 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">
              {name}
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
                <span className="text-terracotta">{t("outOfStockNow")}</span>
              ) : lowStock ? (
                <span className="text-copper">
                  {t("unitsLeft", { count: product.stockCount })}
                </span>
              ) : (
                <span className="text-olive">{t("inStock")}</span>
              )}
            </div>

            <div
              className="prose-art mt-6 text-[0.95rem] text-charcoal/85"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
            />

            {(materials || dimensions) && (
              <dl className="mt-6 space-y-1 text-sm text-charcoal/80">
                {materials && (
                  <div className="flex gap-2">
                    <dt className="text-charcoal/50">{t("materials")}:</dt>
                    <dd>{materials}</dd>
                  </div>
                )}
                {dimensions && (
                  <div className="flex gap-2">
                    <dt className="text-charcoal/50">{t("dimensions")}:</dt>
                    <dd dir="ltr">{dimensions} {t("cm")}</dd>
                  </div>
                )}
              </dl>
            )}

            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton product={product} withQuantity />
            </div>

            <ul className="mt-8 space-y-2 border-t border-charcoal/10 pt-6 text-sm text-charcoal/70">
              <li>· {t("handcrafted")}</li>
              <li>· {t("shippingDetail")}</li>
              <li>· {t("giftNote")}</li>
            </ul>
          </div>
        </FadeIn>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <FadeIn className="mb-8">
            <h2 className="font-serif text-2xl text-ink md:text-3xl">
              {t("related")}
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
