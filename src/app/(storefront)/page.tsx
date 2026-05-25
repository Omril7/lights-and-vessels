import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { CategoryStrip } from "@/components/storefront/CategoryStrip";
import { Testimonials } from "@/components/storefront/Testimonials";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import type { ProductWithImages } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();

  const featured = (await prisma.product.findMany({
    where: { published: true, featured: true },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  })) as ProductWithImages[];

  const hasAnyCategorized =
    (await prisma.product.count({
      where: { published: true, category: { not: null } },
    })) > 0;

  return (
    <>
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
                alt="הסטודיו"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="text-xs uppercase tracking-wider2 text-copper">
              מאחורי הקלעים
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
              מהבנק שליד החלון
            </h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80">
              {content.story_teaser}
            </p>
            <div className="mt-7">
              <Button href="/about" variant="outline">
                לסיפור המלא
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {hasAnyCategorized && <CategoryStrip />}

      <Testimonials />
    </>
  );
}
