"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductImage } from "@prisma/client";
import { localize, cn } from "@/lib/utils";

/** Product photo: one square image with small thumbnails underneath (hover or click to switch). */
export function ProductStage({ images, name }: { images: ProductImage[]; name: string }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden bg-sand">
        {current && (
          <Image
            key={current.id}
            src={current.url}
            alt={localize(current, "alt", locale) || name}
            fill
            priority
            sizes="(max-width: 560px) 88vw, 480px"
            className="object-cover"
          />
        )}
      </div>
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
    </div>
  );
}
