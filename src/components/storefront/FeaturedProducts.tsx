import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import type { ProductWithImages } from "@/types";

export async function FeaturedProducts({
  products,
}: {
  products: ProductWithImages[];
}) {
  if (!products.length) return null;
  const t = await getTranslations("home");

  return (
    <section className="mx-auto max-w-editorial px-5 py-20 md:px-8 md:py-28">
      <FadeIn className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs text-copper">
            {t("handpickedLabel")}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            {t("featured")}
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden shrink-0 border-b border-charcoal/40 pb-1 text-sm text-charcoal transition hover:border-copper hover:text-copper sm:block"
        >
          {t("viewAll")}
        </Link>
      </FadeIn>

      <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 md:gap-y-20">
        {products.slice(0, 6).map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.06}>
            <ProductCard product={p} priority={i < 3} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
