"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCart, cartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "בית" },
  { href: "/shop", label: "החנות" },
  { href: "/about", label: "הסיפור" },
];

export function Navbar() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Avoid hydration mismatch — cart is persisted client-side.
  useEffect(() => setCount(cartCount(items)), [items]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 ease-grace",
        scrolled
          ? "bg-cream/90 backdrop-blur-md border-b border-charcoal/10 shadow-soft"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-editorial items-center justify-between px-5 py-4 md:px-8 lg:py-5">
        <button
          className="md:hidden -ms-2 p-2 text-charcoal"
          aria-label="תפריט"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn(
                  "relative text-sm tracking-wide transition-colors hover:text-ink",
                  pathname === l.href
                    ? "text-ink"
                    : "text-charcoal/70"
                )}
              >
                {l.label}
                {pathname === l.href && (
                  <span className="absolute -bottom-1.5 start-0 h-px w-full bg-copper" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap font-serif text-lg font-medium tracking-wide text-ink sm:text-xl md:text-2xl"
        >
          סטודיו
          <span className="mx-1 hidden text-copper sm:inline">·</span>
          <span className="hidden text-base font-normal text-charcoal/70 sm:inline">
            אורות וכלים
          </span>
        </Link>

        <button
          onClick={openCart}
          className="group relative -me-2 p-2 text-charcoal"
          aria-label="עגלת הקניות"
        >
          <ShoppingBagIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
          {count > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-copper px-1 text-[0.65rem] font-semibold text-cream">
              {count}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-charcoal/10 bg-cream md:hidden">
          <ul className="flex flex-col px-5 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "block py-3 text-base",
                    pathname === l.href ? "text-ink" : "text-charcoal/70"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
