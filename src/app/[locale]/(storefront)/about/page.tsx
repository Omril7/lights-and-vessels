import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteContent, parseGallery } from "@/lib/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { ContactSection } from "@/components/storefront/ContactSection";
import { renderMarkdown } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ABOUT_DESCRIPTION: Record<string, string> = {
  he: "על האמן, הסטודיו, ומלאכת היד שמאחורי כל פריט.",
  en: "About the artist, the studio, and the handcraft behind each piece.",
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("label"),
    description: ABOUT_DESCRIPTION[locale] ?? ABOUT_DESCRIPTION.he,
    alternates: {
      canonical: `/${locale}/about`,
      languages: { he: `/he/about`, en: `/en/about` },
    },
  };
}

export default async function AboutPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("about"),
  ]);
  const content = await getSiteContent({ locale });
  const gallery = parseGallery(content.process_gallery, locale);

  return (
    <div className="pt-28 md:pt-32">
      {/* Intro */}
      <section className="mx-auto max-w-editorial px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <FadeIn>
            <p className="text-xs uppercase tracking-wider2 text-copper">
              {t("label")}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
              {t("heading")}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80">
              {content.story_teaser}
            </p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
              <Image
                src={content.about_portrait}
                alt={t("portraitAlt")}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Rich text body */}
      <section className="wash mt-20 border-y border-charcoal/10 py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-5 md:px-8">
          <FadeIn>
            <article
              className="prose-art text-[1rem] text-charcoal/85"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(content.about_text),
              }}
            />
          </FadeIn>
        </div>
      </section>

      {/* Process gallery */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-editorial px-5 py-20 md:px-8 md:py-24">
          <FadeIn className="mb-8 text-center">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              {t("galleryHeading")}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((img, i) => (
              <FadeIn key={`${img.url}-${i}`} delay={(i % 3) * 0.07}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                  <Image
                    src={img.url}
                    alt={img.alt || t("galleryAlt")}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-grace hover:scale-105"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <ContactSection
        heading={content.contact_heading}
        text={content.contact_text}
        whatsappNumber={content.whatsapp_number}
        whatsappMessage={content.whatsapp_message}
        email={content.contact_email}
      />
    </div>
  );
}
