import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { formatPrice, localize } from "@/lib/utils";
import type { ProductWithImages } from "@/types";

// Staggered widths/offsets for the scrolling photo column — logical
// (ms/me) so the rhythm mirrors correctly in RTL and LTR.
const RHYTHM = [
  "w-full",
  "w-[78%] ms-auto",
  "w-[88%]",
  "w-[70%] ms-[12%]",
];

/**
 * Homepage opener: a sticky statement column on the start side, product
 * still-lifes scrolling past on the end side. Every photo is captioned and
 * links to its product.
 */
export async function HomeSplit({
  title,
  subtitle,
  cta,
  image,
  products,
}: {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  products: ProductWithImages[];
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  return (
    <section className="mx-auto grid max-w-editorial gap-12 px-5 pb-24 pt-10 md:grid-cols-[5fr_7fr] md:gap-16 md:px-8 md:pt-14">
      {/* Statement — sticks while the photos scroll */}
      <div className="md:sticky md:top-28 md:flex md:h-[calc(100vh_-_9rem)] md:flex-col md:justify-between">
        <FadeIn>
          <h1 className="font-serif text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/80">
            {subtitle}
          </p>
        </FadeIn>
        <div className="mt-8 md:mt-0">
          <Link
            href="/shop"
            className="inline-block border-b border-ink pb-1 text-lg text-ink transition-colors hover:border-copper hover:text-copper"
          >
            {cta}
          </Link>
        </div>
      </div>

      {/* Photo column */}
      <div className="flex flex-col gap-16 md:gap-28">
        {image && (
          <FadeIn className={RHYTHM[0]}>
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        )}

        {products.map((p, i) => {
          const name = localize(p, "name", locale);
          const materials = localize(p, "materials", locale);
          const src = p.images[0]?.url;
          if (!src) return null;
          return (
            <FadeIn key={p.id} className={RHYTHM[(i + 1) % RHYTHM.length]}>
              <Link href={`/shop/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  <Image
                    src={src}
                    alt={localize(p.images[0], "alt", locale) || name}
                    fill
                    priority={!image && i === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-base text-ink decoration-1 underline-offset-4 group-hover:underline">
                  {name}
                </p>
                <p className="text-sm text-charcoal/70">
                  {materials && <>{materials} · </>}
                  {formatPrice(p.price)}
                </p>
              </Link>
            </FadeIn>
          );
        })}

        <Link
          href="/shop"
          className="self-start border-b border-ink pb-1 text-lg text-ink transition-colors hover:border-copper hover:text-copper"
        >
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
}
