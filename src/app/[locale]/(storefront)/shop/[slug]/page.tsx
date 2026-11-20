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
import { PUBLIC_STATUSES, STORE_STATUSES, isSoldOut, displayName } from "@/lib/product-status";

export const dynamic = "force-dynamic";

const getProduct = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, status: { in: PUBLIC_STATUSES } },
    include: {
      images: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
      category: true,
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
  const name = displayName(product, locale);
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
      status: { in: STORE_STATUSES },
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  })) as ProductWithImages[];

  const name = displayName(product, locale);
  const description = localize(product, "description", locale);
  const materials = localize(product, "materials", locale);
  const onSale = product.comparePrice != null && product.comparePrice > product.price;
  const soldOut = isSoldOut(product);
  const lowStock = !soldOut && product.stockCount <= 5;
  const tags = product.tags.map((l) => localize(l.tag, "name", locale));
  const dimensions = [product.width, product.height, product.depth]
    .filter((d): d is number => d != null)
    .join(" × ");

  const category = product.category;
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
            href={`/shop?category=${category.slug}`}
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
            <div className="flex flex-wrap items-center gap-3">
              {category && (
                <span className="text-sm text-charcoal/60">{catLabel}</span>
              )}
              {soldOut && <Badge tone="soldout">{t("soldOut")}</Badge>}
              {onSale && !soldOut && <Badge tone="sale">{t("sale")}</Badge>}
            </div>

            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
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

            {tags.length > 0 && (
              <p className="mt-5 text-sm text-charcoal/60">{tags.join(" · ")}</p>
            )}

            <div className="mt-8">
              <AddToCartButton product={product} withQuantity />
            </div>

            {/* Details — native <details> so it works without JS */}
            <div className="mt-10 border-b border-charcoal/20">
              {materials && (
                <DetailRow title={t("materials")} open>
                  <p>{materials}</p>
                  <p className="mt-1 text-charcoal/60">{t("handcrafted")}</p>
                </DetailRow>
              )}
              {dimensions && (
                <DetailRow title={t("dimensions")}>
                  <p>
                    <bdi dir="ltr">{dimensions}</bdi> {t("cm")}
                  </p>
                </DetailRow>
              )}
              <DetailRow title={t("shippingReturns")}>
                <p>{t("shippingDetail")}</p>
                <p className="mt-1">{t("giftNote")}</p>
                <p className="mt-3 flex gap-4">
                  <Link href="/legal/shipping" className="underline underline-offset-4 hover:text-copper">
                    {t("shippingPolicyLink")}
                  </Link>
                  <Link href="/legal/returns" className="underline underline-offset-4 hover:text-copper">
                    {t("returnsPolicyLink")}
                  </Link>
                </p>
              </DetailRow>
            </div>
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 md:gap-y-20">
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

function DetailRow({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group border-t border-charcoal/20">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden
          className="text-xl leading-none text-charcoal/60 transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-charcoal/80">{children}</div>
    </details>
  );
}
