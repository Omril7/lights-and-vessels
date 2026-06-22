import { getLocale, getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteContent, parseTestimonials } from "@/lib/content";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

export async function Testimonials() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("home"),
  ]);
  const content = await getSiteContent({ locale });
  const items = parseTestimonials(content.testimonials, locale);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-editorial px-5 py-20 md:px-8 md:py-28">
      <FadeIn className="mb-10 text-center">
        <p className="text-xs uppercase tracking-wider2 text-copper">{t("testimonialsLabel")}</p>
        <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">{t("testimonials")}</h2>
      </FadeIn>
      <TestimonialsCarousel items={items} />
    </section>
  );
}
