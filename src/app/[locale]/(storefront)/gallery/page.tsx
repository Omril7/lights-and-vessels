import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { displayName } from "@/lib/product-status";
import { alternatesFor } from "@/lib/seo";
import { localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "gallery" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: alternatesFor(params.locale, "/gallery"),
  };
}

type Entry = {
  key: string;
  href: string;
  image: string | null;
  alt: string;
  title: string;
  year: number | null;
  kind: "sold" | "project";
  date: Date;
};

/** Gallery: published projects + sold pieces, newest year first. */
export default async function GalleryPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("gallery")]);
  const [content, projects, sold] = await Promise.all([
    getSiteContent({ locale }),
    prisma.galleryProject.findMany({
      where: { published: true },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      where: { status: "SOLD" },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  const entries: Entry[] = [
    ...projects.map((p) => ({
      key: `p-${p.id}`,
      href: `/gallery/${p.slug}`,
      image: p.images[0]?.url ?? null,
      alt: (p.images[0] && localize(p.images[0], "alt", locale)) || localize(p, "title", locale),
      title: localize(p, "title", locale),
      year: p.year,
      kind: "project" as const,
      date: p.createdAt,
    })),
    ...sold.map((p) => ({
      key: `s-${p.id}`,
      href: `/shop/${p.slug}`,
      image: p.images[0]?.url ?? null,
      alt: (p.images[0] && localize(p.images[0], "alt", locale)) || displayName(p, locale),
      title: displayName(p, locale),
      year: p.year,
      kind: "sold" as const,
      date: p.updatedAt,
    })),
  ].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.date.getTime() - a.date.getTime());

  const heroImage = content.entry_image_gallery || content.hero_image;

  return (
    <>
      <section className="relative h-[clamp(320px,52vh,560px)] overflow-hidden bg-[#1c1612]">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "brightness(0.55) saturate(0.7)" }}
          />
        )}
        <div className="absolute inset-x-5 bottom-10 flex flex-col gap-2 text-[#f2ebda] sm:inset-x-[5vw] sm:bottom-12">
          <h1 className="font-serif text-5xl leading-none md:text-6xl">{t("title")}</h1>
          <p className="font-light text-[#e6ddbf]">{t("subtitle")}</p>
        </div>
      </section>

      <div className="px-5 pb-10 pt-16 sm:px-[5vw] md:pt-20">
        {entries.length === 0 ? (
          <p className="py-24 text-center font-serif text-2xl text-ink">{t("empty")}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-8 gap-y-16">
            {entries.map((e, i) => (
              <FadeIn key={e.key} delay={(i % 3) * 0.06}>
                <Link href={e.href} className="group flex flex-col gap-3.5 text-ink">
                  <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                    {e.image && (
                      <Image
                        src={e.image}
                        alt={e.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        className="object-cover saturate-[0.85]"
                      />
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-stone pt-3">
                    <span className="transition-colors group-hover:text-accent">{e.title}</span>
                    {e.year && <span className="shrink-0 text-[0.95rem] font-light">{e.year}</span>}
                  </div>
                  <span className="-mt-1.5 text-[0.82rem] font-light text-charcoal/80">
                    {e.kind === "sold" ? t("sold") : t("project")}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
