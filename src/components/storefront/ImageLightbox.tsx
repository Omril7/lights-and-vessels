"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from "@heroicons/react/24/outline";

const ZOOM = 2.5;

export type LightboxImage = { url: string; alt: string };

/**
 * Full-screen photo viewer with zoom.
 * - Click / tap the photo to zoom in at that spot; move the mouse or drag a
 *   finger to pan; click again to zoom out.
 * - Keys: Esc close · ←/→ previous/next · + / − zoom.
 */
export function ImageLightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations("product");
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const current = images[index];

  const go = useCallback(
    (delta: number) => {
      setZoomed(false);
      onIndex((index + delta + count) % count);
    },
    [index, count, onIndex]
  );

  /** Pointer position inside the photo frame, as percentages (the zoom origin). */
  const originFrom = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return origin;
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    };
  };

  // Keyboard, scroll lock, initial focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(document.dir === "rtl" ? 1 : -1);
      else if (e.key === "ArrowRight") go(document.dir === "rtl" ? -1 : 1);
      else if (e.key === "+" || e.key === "=") setZoomed(true);
      else if (e.key === "-") setZoomed(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  if (!current) return null;

  const iconBtn =
    "flex h-11 w-11 items-center justify-center text-[#efe7d8] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#efe7d8]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("lightbox")}
      className="fixed inset-0 z-[95] flex flex-col bg-[#120e0b]/95"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t("close")} className={iconBtn}>
          <XMarkIcon className="h-6 w-6" />
        </button>
        {count > 1 && (
          <p className="text-sm font-light tabular-nums text-[#cfc5ae]" aria-live="polite">
            {index + 1} / {count}
          </p>
        )}
        <button
          type="button"
          onClick={() => setZoomed((z) => !z)}
          aria-pressed={zoomed}
          aria-label={zoomed ? t("zoomOut") : t("zoomIn")}
          className={iconBtn}
        >
          {zoomed ? <MagnifyingGlassMinusIcon className="h-6 w-6" /> : <MagnifyingGlassPlusIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Photo */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16">
        <div
          ref={stageRef}
          onClick={(e) => {
            setOrigin(originFrom(e));
            setZoomed((z) => !z);
          }}
          onPointerMove={(e) => {
            if (zoomed) setOrigin(originFrom(e));
          }}
          className={`relative h-full w-full touch-none overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        >
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt}
            fill
            sizes="100vw"
            quality={90}
            priority
            draggable={false}
            className="select-none object-contain transition-transform duration-200 ease-out"
            style={{
              transform: zoomed ? `scale(${ZOOM})` : "scale(1)",
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("prevPhoto")}
              className={`${iconBtn} absolute start-2 top-1/2 -translate-y-1/2 bg-black/30`}
            >
              <ChevronRightIcon className="h-6 w-6 ltr:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("nextPhoto")}
              className={`${iconBtn} absolute end-2 top-1/2 -translate-y-1/2 bg-black/30`}
            >
              <ChevronLeftIcon className="h-6 w-6 ltr:rotate-180" />
            </button>
          </>
        )}
      </div>

      <p className="pb-3 text-center text-xs font-light text-[#a89c86]">{zoomed ? t("zoomHintOut") : t("zoomHintIn")}</p>
    </div>
  );
}
