import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
// import { CategoryStrip } from "@/components/storefront/CategoryStrip"; // CATEGORIES_DISABLED
import { Testimonials } from "@/components/storefront/Testimonials";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import type { ProductWithImages } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { he: `/he`, en: `/en` },
    },
  };
}

export default async function HomePage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("home"),
  ]);
  const content = await getSiteContent({ locale });

  const featured = (await prisma.product.findMany({
    where: { published: true, featured: true },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 8,
  })) as ProductWithImages[];

  // CATEGORIES_DISABLED: const hasAnyCategorized = (await prisma.product.count({ where: { published: true, category: { not: null } } })) > 0;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lights-and-vessels.vercel.app";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "אורות וכלים",
    url: siteUrl,
    logo: `${siteUrl}/logo-2169x1282-black.png`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HeroBanner
        title={content.hero_title}
        subtitle={content.hero_subtitle}
        image={content.hero_image}
        cta={content.hero_cta}
      />

      <FeaturedProducts products={featured} />

      {/* Artist story teaser */}
      <section className="bg-linen paper-grain">
        <div className="mx-auto grid max-w-editorial items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <FadeIn>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand md:aspect-[5/6]">
              <Image
                src={content.story_image}
                alt={t("storyImageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="text-xs uppercase tracking-wider2 text-copper">
              {t("storyLabel")}
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
              {t("storyHeading")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80">
              {content.story_teaser}
            </p>
            <div className="mt-7">
              <Button href="/about" variant="outline">
                {t("storyLink")}
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CATEGORIES_DISABLED: {hasAnyCategorized && <CategoryStrip />} */}

      <Testimonials />
    </>
  );
}
