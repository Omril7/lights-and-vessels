import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/types";
import { FadeIn } from "@/components/ui/FadeIn";

const categoryImage: Record<string, string> = {
  rings: "https://picsum.photos/seed/cat-rings/600/700",
  necklaces: "https://picsum.photos/seed/cat-necklaces/600/700",
  bracelets: "https://picsum.photos/seed/cat-bracelets/600/700",
  earrings: "https://picsum.photos/seed/cat-earrings/600/700",
  "home-decor": "https://picsum.photos/seed/cat-home/600/700",
};

export function CategoryStrip() {
  return (
    <section className="wash border-y border-charcoal/10 py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-5 md:px-8">
        <FadeIn className="mb-10 text-center">
          <p className="text-xs uppercase tracking-wider2 text-copper">
            לפי קטגוריה
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            עיון באוסף
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <FadeIn key={c.slug} delay={i * 0.07}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="group block"
              >
                <div className="relative aspect-[5/6] overflow-hidden rounded-xl bg-sand">
                  <Image
                    src={categoryImage[c.slug]}
                    alt={c.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-grace group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-center font-serif text-lg text-cream">
                    {c.label}
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
