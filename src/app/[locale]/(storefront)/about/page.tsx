import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteContent, parseGallery } from "@/lib/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { ContactSection } from "@/components/storefront/ContactSection";
import { Testimonials } from "@/components/storefront/Testimonials";
import { renderMarkdown } from "@/lib/utils";
import { alternatesFor } from "@/lib/seo";

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
    alternates: alternatesFor(locale, `/about`),
  };
}

export default async function AboutPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("about"),
  ]);
  const content = await getSiteContent({ locale });
  const gallery = parseGallery(content.process_gallery, locale);
  const lines = (v: string | undefined) =>
    (v ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const materials = lines(content.about_materials);
  const process = lines(content.about_process);

  return (
    <div className="pt-28 md:pt-32">
      {/* Intro — the statement, large, beside the portrait */}
      <section className="mx-auto max-w-editorial px-5 md:px-8">
        <div className={`grid items-end gap-10 md:gap-16 ${content.about_portrait ? "md:grid-cols-[7fr_5fr]" : ""}`}>
          <FadeIn>
            <h1 className="text-sm text-charcoal/60">{t("heading")}</h1>
            <p className="mt-4 max-w-4xl font-serif text-3xl leading-[1.25] text-ink md:text-4xl lg:text-5xl">
              {content.story_teaser}
            </p>
          </FadeIn>
          {content.about_portrait && (
          <FadeIn delay={0.12}>
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Image
                src={content.about_portrait}
                alt={t("portraitAlt")}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
          )}
        </div>
      </section>

      {/* Two short lists — materials and process */}
      {(materials.length > 0 || process.length > 0) && (
        <section className="mx-auto mt-24 grid max-w-editorial gap-14 px-5 md:mt-32 md:grid-cols-2 md:gap-16 md:px-8">
          {materials.length > 0 && (
            <FadeIn>
              <h2 className="text-sm text-charcoal/60">{t("materialsHeading")}</h2>
              <ul className="mt-4 border-b border-charcoal/20">
                {materials.map((m) => (
                  <li key={m} className="border-t border-charcoal/20 py-3 text-xl text-ink">
                    {m}
                  </li>
                ))}
              </ul>
            </FadeIn>
          )}
          {process.length > 0 && (
            <FadeIn delay={0.08}>
              <h2 className="text-sm text-charcoal/60">{t("processHeading")}</h2>
              <ol className="mt-4 border-b border-charcoal/20">
                {process.map((step, i) => (
                  <li key={step} className="flex gap-4 border-t border-charcoal/20 py-3 text-xl text-ink">
                    <span className="w-6 shrink-0 text-base text-charcoal/50 tabular-nums">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </FadeIn>
          )}
        </section>
      )}

      {/* Full story */}
      <section className="mx-auto mt-24 max-w-2xl px-5 md:mt-32 md:px-8">
        <FadeIn>
          <article
            className="prose-art text-[1.05rem] text-charcoal/85"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content.about_text),
            }}
          />
        </FadeIn>
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
                <div className="relative aspect-square overflow-hidden bg-sand">
                  <Image
                    src={img.url}
                    alt={img.alt || t("galleryAlt")}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <Testimonials />

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
