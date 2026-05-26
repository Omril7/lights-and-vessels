import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteContent, parseTestimonials } from "@/lib/content";

export async function Testimonials() {
  const content = await getSiteContent();
  const items = parseTestimonials(content.testimonials);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-editorial px-5 py-20 md:px-8 md:py-28">
      <FadeIn className="mb-10 text-center">
        <p className="text-xs uppercase tracking-wider2 text-copper">
          מה אומרים
        </p>
        <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
          מילים מלקוחות
        </h2>
      </FadeIn>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((t, i) => {
          const initials = t.name
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("");
          return (
            <FadeIn key={`${t.name}-${i}`} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-2xl border border-charcoal/10 bg-linen p-6 md:p-7">
                <div className="mb-3 text-3xl leading-none text-clay" aria-hidden>
                  &ldquo;
                </div>
                <blockquote className="flex-1 font-serif text-lg leading-relaxed text-ink">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-sand text-sm font-medium text-charcoal/70">
                    {t.image ? (
                      <Image
                        src={t.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      initials || "·"
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-charcoal">
                      {t.name}
                    </span>
                    {t.detail && (
                      <span className="block text-xs text-charcoal/55">
                        {t.detail}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
