import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteContent, parseTestimonials } from "@/lib/content";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

export async function Testimonials() {
  const content = await getSiteContent();
  const items = parseTestimonials(content.testimonials);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-editorial px-5 py-20 md:px-8 md:py-28">
      <FadeIn className="mb-10 text-center">
        <p className="text-xs uppercase tracking-wider2 text-copper">מה אומרים</p>
        <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">מילים מלקוחות</h2>
      </FadeIn>
      <TestimonialsCarousel items={items} />
    </section>
  );
}
