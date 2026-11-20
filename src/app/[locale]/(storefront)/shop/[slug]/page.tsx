import type { Metadata } from "next";
import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { ProductStage } from "@/components/storefront/ProductStage";
import { StampBuyButton } from "@/components/storefront/StampBuyButton";
import { ProductCard } from "@/components/storefront/ProductCard";
import { renderMarkdown, localize, whatsappUrl } from "@/lib/utils";
import type { ProductWithImages } from "@/types";
import { PUBLIC_STATUSES, STORE_STATUSES, isSoldOut, displayName } from "@/lib/product-status";
import { alternatesFor, localePath } from "@/lib/seo";

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
    alternates: alternatesFor(locale, `/shop/${product.slug}`),
    openGraph: {
      type: "website",
      title: name,
      description,
      url: localePath(locale, `/shop/${product.slug}`),
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

  const [content, related] = await Promise.all([
    getSiteContent({ locale }),
    prisma.product.findMany({
      where: {
        status: { in: STORE_STATUSES },
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: { images: { orderBy: { order: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
    }) as Promise<ProductWithImages[]>,
  ]);

  const name = displayName(product, locale);
  const description = localize(product, "description", locale);
  const materials = localize(product, "materials", locale);
  const soldOut = isSoldOut(product);
  const dimensions = [product.height, product.width, product.depth]
    .filter((d): d is number => d != null)
    .join(" × ");

  // "פריט יחיד · אריח טרצו עתיק, ברזל חלוד · 20 × 12 ס״מ · 2026"
  const spec = [
    product.isUnique ? t("oneOfAKind") : null,
    materials || null,
    dimensions ? `${dimensions} ${t("cm")}` : null,
    product.year ? String(product.year) : null,
  ].filter(Boolean) as string[];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lights-and-vessels.vercel.app";
  const pageUrl = `${siteUrl}${localePath(locale, `/shop/${product.slug}`)}`;
  const askHref = whatsappUrl(content.whatsapp_number, t("askMessage", { name, url: pageUrl }));

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
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: pageUrl,
    },
  };

  const stampLink =
    "ink flex min-h-[44px] flex-1 items-center justify-center border-[1.5px] border-stamp text-[0.8rem] font-bold text-stamp transition-opacity hover:opacity-70";

  return (
    <div className="paper-grain px-5 pb-10 pt-8 sm:px-[5vw]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="mx-auto flex w-[min(480px,100%)] flex-col gap-3">
        <ProductStage images={product.images} name={name} />

        <div className="flex flex-col items-center gap-1.5 pb-0.5 pt-1.5 text-center">
          <h1 className="font-serif text-5xl font-medium leading-none tracking-[0.04em] text-ink md:text-[52px]">
            {name}
          </h1>
          {spec.length > 0 && (
            <p className="text-[0.72rem] leading-relaxed tracking-[0.06em] text-ink-2">
              {spec.join(" · ")}
            </p>
          )}
        </div>

        <StampBuyButton product={product} />

        <div className="flex gap-2.5">
          <Link href="/shop" className={stampLink}>
            {t("backToStore")}
          </Link>
          {content.whatsapp_number && (
            <a href={askHref} target="_blank" rel="noopener noreferrer" className={stampLink}>
              {t("askAbout")}
            </a>
          )}
        </div>

        {/* Description + details, below the fold */}
        {description && (
          <div
            className="prose-art mt-10 text-[0.95rem] font-light text-ink-2"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
          />
        )}
        <div className="mt-6 border-b border-stone">
          {materials && (
            <DetailRow title={t("materials")}>
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
              <Link href="/legal/shipping" className="underline underline-offset-4 hover:text-accent">
                {t("shippingPolicyLink")}
              </Link>
              <Link href="/legal/returns" className="underline underline-offset-4 hover:text-accent">
                {t("returnsPolicyLink")}
              </Link>
            </p>
          </DetailRow>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="mb-8 font-serif text-2xl text-ink md:text-3xl">{t("related")}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-8 gap-y-16">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
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
    <details open={open} className="group border-t border-stone">
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
