"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductImage } from "@prisma/client";
import { MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";
import { localize, cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/storefront/ImageLightbox";

/**
 * Product photo: one square image with small thumbnails underneath (hover or
 * click to switch). Clicking the photo opens it full-screen with zoom.
 */
export function ProductStage({ images, name }: { images: ProductImage[]; name: string }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const current = images[active];
  const [lightbox, setLightbox] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const altFor = (img: ProductImage) => localize(img, "alt", locale) || name;

  return (
    <div className="flex flex-col gap-3">
      <button
        ref={openerRef}
        type="button"
        onClick={() => current && setLightbox(true)}
        aria-label={t("openLightbox")}
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {current && (
          <Image
            key={current.id}
            src={current.url}
            alt={altFor(current)}
            fill
            priority
            sizes="(max-width: 560px) 88vw, 480px"
            className="object-cover"
          />
        )}
        <span
          aria-hidden
          className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center bg-ink/70 text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </span>
      </button>
      {images.length > 1 && (
        <div role="group" aria-label={t("morePhotos")} className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={t("photoN", { n: i + 1 })}
              aria-pressed={i === active}
              className={cn(
                "relative h-14 w-14 overflow-hidden border transition-opacity",
                i === active ? "border-ink opacity-100" : "border-transparent opacity-50 hover:opacity-80"
              )}
            >
              <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          images={images.map((img) => ({ url: img.url, alt: altFor(img) }))}
          index={active}
          onIndex={setActive}
          onClose={() => {
            setLightbox(false);
            openerRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
