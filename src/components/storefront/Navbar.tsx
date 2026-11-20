"use client";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useCart, cartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/storefront/ThemeSwitcher";

/**
 * Site header: logo (back to the entry page) on the start side, the three
 * doors + cart on the end side. Sticky, on the page's paper colour, with a
 * hairline underneath.
 */
export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/gallery", label: t("gallery") },
    { href: "/about", label: t("about") },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Avoid hydration mismatch — cart is persisted client-side.
  useEffect(() => setCount(cartCount(items)), [items]);
  useEffect(() => setMobileOpen(false), [pathname]);

  const cartButton = (
    <button
      type="button"
      onClick={openCart}
      aria-label={t("cartLabel")}
      className="transition-colors hover:text-accent"
    >
      {t("cart", { count })}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-stone bg-cream">
      <nav className="flex items-center justify-between gap-4 px-5 py-4 sm:px-[5vw]">
        <Link href="/" aria-label={t("backToEntry")} className="flex items-center">
          <Image
            src="/logo-2169x1282-black.png"
            alt={t("logoAlt")}
            width={120}
            height={71}
            className="brand-logo h-[34px] w-auto"
            priority
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-7 text-[0.95rem] font-light md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "transition-colors hover:text-accent",
                isActive(l.href) ? "text-accent" : "text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
          {cartButton}
          <span className="flex items-center gap-1">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </span>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 text-sm font-light md:hidden">
          {cartButton}
          <button
            className="-me-2 p-2 text-ink"
            aria-label={t("menu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-stone bg-cream md:hidden">
          <ul className="flex flex-col px-5 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "block py-3 font-serif text-2xl font-light",
                    isActive(l.href) ? "text-accent" : "text-ink"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-3 py-3">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
