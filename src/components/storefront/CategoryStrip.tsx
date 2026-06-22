import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { CATEGORIES } from "@/types";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteContent, parseCategoryImages } from "@/lib/content";

const CATEGORY_KEYS: Record<string, "rings" | "necklaces" | "bracelets" | "earrings" | "homeDecor"> = {
  rings: "rings",
  necklaces: "necklaces",
  bracelets: "bracelets",
  earrings: "earrings",
  "home-decor": "homeDecor",
};

export async function CategoryStrip() {
  const [locale, t, tCat] = await Promise.all([
    getLocale(),
    getTranslations("home"),
    getTranslations("categories"),
  ]);
  const content = await getSiteContent({ locale });
  const images = parseCategoryImages(content.category_images);
  const items = CATEGORIES.filter((c) => images[c.slug]);

  if (!items.length) return null;

  return (
    <section className="wash border-y border-charcoal/10 py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-5 md:px-8">
        <FadeIn className="mb-10 text-center">
          <p className="text-xs uppercase tracking-wider2 text-copper">
            {t("categoryLabel")}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            {t("browse")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {items.map((c, i) => (
            <FadeIn key={c.slug} delay={i * 0.07}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="group block"
              >
                <div className="relative aspect-[5/6] overflow-hidden rounded-xl bg-sand">
                  <Image
                    src={images[c.slug]}
                    alt={tCat(CATEGORY_KEYS[c.slug] ?? (c.slug as never))}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-grace group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-center font-serif text-lg text-cream">
                    {tCat(CATEGORY_KEYS[c.slug] ?? (c.slug as never))}
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
