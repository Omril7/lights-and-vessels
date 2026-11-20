"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart, cartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

type Door = "store" | "gallery" | "about";
export type EntryImages = Record<"none" | Door, string>;

const DOORS: { id: Door; href: string }[] = [
  { id: "store", href: "/shop" },
  { id: "gallery", href: "/gallery" },
  { id: "about", href: "/about" },
];

/**
 * The homepage: a full-screen photo, the logo and one line, and three doors.
 * Hovering (or focusing) a door crossfades the background to that section's
 * photo and dims the other doors.
 */
export function Entry({ line, images }: { line: string; images: EntryImages }) {
  const t = useTranslations("entry");
  const locale = useLocale();
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState<Door | null>(null);

  // Cart is persisted client-side — read it after mount to avoid a hydration mismatch.
  useEffect(() => setCount(cartCount(items)), [items]);

  const layers: ("none" | Door)[] = ["none", "store", "gallery", "about"];
  const active = hover ?? "none";
  const otherLocale = locale === "he" ? "en" : "he";

  return (
    <div className="on-dark relative min-h-[100svh] overflow-hidden bg-[#1c1612] text-[#e6ddbf]">
      {/* Background layers, crossfaded */}
      {layers.map((k) => (
        <Image
          key={k}
          src={images[k]}
          alt=""
          aria-hidden
          fill
          priority={k === "none"}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-grace",
            k === active ? "opacity-100" : "opacity-0"
          )}
          style={{ filter: "brightness(0.62) saturate(0.85)" }}
        />
      ))}
      {/* Legibility: darken the bottom where the text sits */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="relative grid min-h-[100svh] grid-rows-[auto_1fr_auto] gap-8 px-5 pb-10 pt-8 sm:px-[5vw]">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex gap-6 text-sm font-light">
            <button
              type="button"
              onClick={openCart}
              className="text-[#cfc5ae] transition-colors hover:text-white"
            >
              {t("cart", { count })}
            </button>
            <Link
              href={pathname}
              locale={otherLocale}
              lang={otherLocale}
              className="text-[#cfc5ae] transition-colors hover:text-white"
            >
              {otherLocale === "en" ? "EN" : "עב"}
            </Link>
          </div>
          <p lang="en" dir="ltr" className="text-xs uppercase tracking-[0.32em] text-[#cfc5ae]">
            Orot Vekelim · Design studio
          </p>
        </div>

        <div />

        {/* Bottom row */}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col items-start gap-4">
            <Image
              src="/logo-2169x1282-black.png"
              alt={t("logoAlt")}
              width={320}
              height={189}
              priority
              className="h-auto w-[clamp(200px,22vw,320px)]"
              style={{ filter: "invert(0.9) sepia(0.25)", mixBlendMode: "screen" }}
            />
            <h1 className="max-w-[22rem] font-serif text-xl font-light leading-relaxed">
              {line}
            </h1>
          </div>

          <nav aria-label={t("navLabel")} className="flex flex-col items-end gap-1.5">
            {DOORS.map((d) => (
              <Link
                key={d.id}
                href={d.href}
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(d.id)}
                onBlur={() => setHover(null)}
                className={cn(
                  "font-serif text-[clamp(1.75rem,2.6vw,2.25rem)] font-light leading-tight transition-colors duration-300",
                  hover && hover !== d.id ? "text-[#a89c86]" : "text-[#f2ebda]"
                )}
              >
                {t(d.id)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
