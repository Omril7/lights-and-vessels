"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export function BlogGallery({
  images,
  title,
}: {
  images: { url: string; alt: string | null }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!images.length) {
    return <div className="aspect-[16/9] rounded-2xl bg-sand" aria-hidden />;
  }

  const current = images[active];

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + images.length) % images.length);

  const onTouchEnd = (endX: number) => {
    if (touchStartX.current === null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40 || images.length < 2) return;
    go(delta < 0 ? 1 : -1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[16/9] touch-pan-y overflow-hidden rounded-2xl bg-sand"
        onTouchStart={(e) =>
          (touchStartX.current = e.touches[0]?.clientX ?? null)
        }
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.alt || title}
              fill
              priority
              sizes="(max-width:768px) 100vw, 800px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(1)}
              aria-label="הבא"
              className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-2 text-charcoal shadow-soft transition hover:bg-cream"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(-1)}
              aria-label="הקודם"
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-2 text-charcoal shadow-soft transition hover:bg-cream"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((img, i) => (
                <span
                  key={img.url}
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

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar p-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`תצוגה ${i + 1}`}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-sand transition-all duration-300 ease-grace",
                i === active
                  ? "scale-105 shadow-soft ring-2 ring-copper"
                  : "opacity-55 ring-1 ring-charcoal/15 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
