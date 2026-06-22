"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlassPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/components/ui/Modal";
import type { ProductImage } from "@prisma/client";
import { cn } from "@/lib/utils";

/** Lightbox image with click-to-zoom and cursor-tracked panning. */
function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const track = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden",
        zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
      )}
      onClick={() => setZoomed((z) => !z)}
      onMouseMove={(e) => zoomed && track(e.clientX, e.clientY, e.currentTarget)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (zoomed && t) track(t.clientX, t.clientY, e.currentTarget);
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="90vw"
        className="object-contain transition-transform duration-300 ease-grace"
        style={{
          transform: zoomed ? "scale(2.4)" : "scale(1)",
          transformOrigin: origin,
        }}
      />
      <span className="pointer-events-none absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs text-cream rtl:translate-x-1/2">
        {zoomed ? "לחצו להקטנה" : "לחצו להגדלה"}
      </span>
    </div>
  );
}

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const safe = images.length ? images : [];
  const current = safe[active];

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + safe.length) % safe.length);

  const onTouchEnd = (endX: number) => {
    if (touchStartX.current === null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40 || safe.length < 2) return;
    // Swipe left → next, swipe right → previous.
    go(delta < 0 ? 1 : -1);
  };

  if (!safe.length) {
    return <div className="aspect-[4/5] rounded-2xl bg-sand" aria-hidden />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="group relative aspect-[4/5] touch-pan-y overflow-hidden rounded-2xl bg-sand"
        onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.alt_he ?? name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setLightbox(true)}
          aria-label="הגדלת התמונה"
          className="absolute end-4 top-4 rounded-full bg-cream/90 p-2.5 text-charcoal opacity-100 shadow-soft transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </button>

        {safe.length > 1 && (
          <>
            <button
              onClick={() => go(1)}
              aria-label="התמונה הבאה"
              className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-2 text-charcoal shadow-soft transition hover:bg-cream"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(-1)}
              aria-label="התמונה הקודמת"
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-2 text-charcoal shadow-soft transition hover:bg-cream"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {safe.map((img, i) => (
                <span
                  key={img.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === active ? "w-5 bg-cream" : "w-1.5 bg-cream/55"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {safe.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar p-1">
          {safe.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`תצוגה ${i + 1}`}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-sand transition-all duration-300 ease-grace",
                i === active
                  ? "scale-105 shadow-soft ring-2 ring-copper"
                  : "opacity-55 ring-1 ring-charcoal/15 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_he ?? name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Modal open={lightbox} onClose={() => setLightbox(false)} label={name}>
        <ZoomImage src={current.url} alt={current.alt_he ?? name} />
      </Modal>
    </div>
  );
}
