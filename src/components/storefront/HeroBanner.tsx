import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HeroBanner({
  title,
  subtitle,
  image,
  cta,
}: {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}) {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Warm wash gradient — readable text over photography */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-editorial flex-col justify-end px-5 pb-20 md:px-8 md:pb-28">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-wider2 text-cream/80">
            אוסף הסטודיו
          </p>
          <h1 className="font-serif text-4xl leading-[1.1] text-cream sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/85 md:text-lg">
            {subtitle}
          </p>
          <div className="mt-8">
            <Button href="/shop" size="lg" className="bg-cream text-ink hover:bg-linen">
              {cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
