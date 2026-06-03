"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { EmblaCarouselType } from "embla-carousel";

export type TestimonialItem = {
  quote: string;
  name: string;
  detail?: string;
  image?: string;
};

// ─── Tween helpers ────────────────────────────────────────────────────────────

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** Applies scale + opacity + parallax tweens on every scroll tick. */
function useTweens(emblaApi: EmblaCarouselType | undefined) {
  const apply = useCallback((api: EmblaCarouselType) => {
    const engine = api.internalEngine();
    const progress = api.scrollProgress();
    const snaps = api.scrollSnapList();

    snaps.forEach((snap, snapIdx) => {
      let diff = snap - progress;

      const slideIdxs = engine.slideRegistry[snapIdx];
      slideIdxs.forEach((slideIdx) => {
        // Loop-point correction so cloned slides tween correctly
        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((lp) => {
            const target = lp.target();
            if (slideIdx === lp.index && target !== 0) {
              diff = Math.sign(target) === -1
                ? snap - (1 + progress)
                : snap + (1 - progress);
            }
          });
        }

        // t = 0 at the centred snap, ±1 further away
        const t = diff * snaps.length;
        const inner = api.slideNodes()[slideIdx]
          .querySelector<HTMLElement>("[data-tween]");
        if (!inner) return;

        const scale   = clamp(1 - Math.abs(t) * 0.09, 0.88, 1);
        const opacity = clamp(1 - Math.abs(t) * 0.55, 0.35, 1);
        const parallax = t * -8; // % shift

        inner.style.transform = `scale(${scale}) translateX(${parallax}%)`;
        inner.style.opacity   = String(opacity);
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    apply(emblaApi);
    emblaApi.on("reInit", apply).on("scroll", apply).on("slideFocus", apply);
    return () => {
      emblaApi.off("reInit", apply).off("scroll", apply).off("slideFocus", apply);
    };
  }, [emblaApi, apply]);
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ t }: { t: TestimonialItem }) {
  const initials = t.name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("");
  return (
    // data-tween receives the JS-driven scale/opacity/parallax transforms
    <figure
      dir="rtl"
      data-tween
      className="flex h-full flex-col rounded-2xl border border-charcoal/10 bg-linen p-6 shadow-soft will-change-transform select-none md:p-7"
    >
      <div className="mb-3 text-3xl leading-none text-clay" aria-hidden>&ldquo;</div>
      <blockquote className="flex-1 font-serif text-lg leading-relaxed text-ink">
        {t.quote}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sand text-sm font-medium text-charcoal/70">
          {t.image
            ? <Image src={t.image} alt="" fill sizes="44px" className="object-cover" />
            : (initials || "·")}
        </span>
        <span>
          <span className="block text-sm font-medium text-charcoal">{t.name}</span>
          {t.detail && <span className="block text-xs text-charcoal/55">{t.detail}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

// ─── Nav button ───────────────────────────────────────────────────────────────

function NavBtn({ onClick, dir }: { onClick: () => void; dir: "prev" | "next" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={dir === "prev" ? "הקודם" : "הבא"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/25 text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal/[0.06]"
    >
      {dir === "prev"
        ? <ChevronRightIcon className="h-5 w-5" />
        : <ChevronLeftIcon  className="h-5 w-5" />}
    </motion.button>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const n = items.length;
  if (!n) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "center", direction: "ltr" },
    [ClassNames({ snapped: "is-snapped", inView: "is-in-view" })]
  );

  useTweens(emblaApi);

  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect).off("reInit", onSelect); };
  }, [emblaApi]);

  return (
    <div>
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden py-6 -mx-2 px-2">
        <div className="flex -mx-3 items-stretch" dir="ltr">
          {items.map((t, i) => (
            <div
              key={i}
              // Responsive slides per view: 1 → 2 → 3
              className="min-w-0 shrink-0 grow-0 basis-full px-3 sm:basis-1/2 md:basis-1/3"
            >
              <Card t={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <NavBtn onClick={() => emblaApi?.scrollPrev()} dir="prev" />

        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`עמוד ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === selectedIdx ? "w-5 bg-charcoal" : "w-1.5 bg-charcoal/25"
              )}
            />
          ))}
        </div>

        <NavBtn onClick={() => emblaApi?.scrollNext()} dir="next" />
      </div>
    </div>
  );
}
