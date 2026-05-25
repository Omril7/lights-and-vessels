import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

type Testimonial = {
  quote: string;
  name: string;
  detail: string;
  seed: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "קיבלתי את הטבעת עטופה בנייר משי עם פתק כתוב ביד. מרגישים שמישהו באמת נגע בכל פרט.",
    name: "נועה ברק",
    detail: "תל אביב",
    seed: "review-noa",
  },
  {
    quote:
      "הזמנתי שרשרת כמתנה והיא הפכה לפריט שאני לובשת כל יום. האיכות פשוט אחרת.",
    name: "מיכל אדרי",
    detail: "לקוחה חוזרת",
    seed: "review-michal",
  },
  {
    quote:
      "ביקשתי התאמה אישית קטנה, וקיבלתי יחס סבלני וחם לאורך כל הדרך. אאהב לחזור.",
    name: "דנה פלד",
    detail: "חיפה",
    seed: "review-dana",
  },
];

export function Testimonials() {
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
        {TESTIMONIALS.map((t, i) => (
          <FadeIn key={t.seed} delay={i * 0.1}>
            <figure className="flex h-full flex-col rounded-2xl border border-charcoal/10 bg-linen p-6 md:p-7">
              <div className="mb-3 text-3xl leading-none text-clay" aria-hidden>
                &ldquo;
              </div>
              <blockquote className="flex-1 font-serif text-lg leading-relaxed text-ink">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="relative h-11 w-11 overflow-hidden rounded-full bg-sand">
                  <Image
                    src={`https://picsum.photos/seed/${t.seed}/100/100`}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="block text-sm font-medium text-charcoal">
                    {t.name}
                  </span>
                  <span className="block text-xs text-charcoal/55">
                    {t.detail}
                  </span>
                </span>
              </figcaption>
            </figure>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
