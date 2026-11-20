import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { STORE_STATUSES } from "@/lib/product-status";
import { alternatesFor } from "@/lib/seo";
import { cn, localize } from "@/lib/utils";
import type { ProductWithImages } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "shop" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: alternatesFor(params.locale, "/shop"),
  };
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("shop")]);
  const [content, categories] = await Promise.all([
    getSiteContent({ locale }),
    prisma.productCategory.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);

  const active = categories.find((c) => c.slug === searchParams.category)?.slug ?? null;
  const products = (await prisma.product.findMany({
    where: {
      status: { in: STORE_STATUSES },
      ...(active ? { category: { slug: active } } : {}),
    },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })) as ProductWithImages[];

  const heroImage = content.store_hero_image || content.entry_image_store || content.hero_image;
  const filters = [
    { slug: null as string | null, label: t("all") },
    ...categories.map((c) => ({ slug: c.slug as string | null, label: localize(c, "name", locale) })),
  ];

  return (
    <>
      {/* Banner */}
      <section className="relative h-[clamp(320px,52vh,560px)] overflow-hidden bg-[#1c1612]">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "50% 40%", filter: "brightness(0.62) saturate(0.85)" }}
          />
        )}
        <div className="absolute inset-x-5 bottom-10 flex flex-col gap-2 text-[#f2ebda] sm:inset-x-[5vw] sm:bottom-12">
          <h1 className="font-serif text-5xl leading-none md:text-6xl">{t("title")}</h1>
          <p className="font-light text-[#e6ddbf]">{t("subtitle")}</p>
        </div>
      </section>

      <div className="flex flex-col gap-12 px-5 pb-10 pt-16 sm:px-[5vw] md:pt-20">
        {/* Category filters */}
        <div
          role="group"
          aria-label={t("filterLabel")}
          className="flex flex-wrap justify-end gap-2"
        >
          {filters.map((f) => {
            const on = f.slug === active;
            return (
              <Link
                key={f.slug ?? "all"}
                href={f.slug ? `/shop?category=${f.slug}` : "/shop"}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex min-h-[44px] items-center border px-[18px] text-sm font-light transition-colors",
                  on
                    ? "border-ink bg-ink text-cream"
                    : "border-stone text-ink hover:border-ink"
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {products.length === 0 ? (
          <p className="py-24 text-center font-serif text-2xl text-ink">{t("emptyCategory")}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-8 gap-y-16">
            {products.map((p, i) => (
              <FadeIn key={p.id} delay={(i % 3) * 0.06}>
                <ProductCard product={p} priority={i < 3} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
