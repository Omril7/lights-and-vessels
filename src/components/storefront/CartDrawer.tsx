"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart, cartSubtotal, cartCount } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem } = useCart();
  const subtotal = cartSubtotal(items);
  const count = cartCount(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          {/* RTL: drawer slides in from the left */}
          <motion.aside
            className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-cream shadow-lift"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="עגלת הקניות"
          >
            <header className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
              <h2 className="font-serif text-xl text-ink">
                העגלה שלך
                {count > 0 && (
                  <span className="ms-2 text-sm text-charcoal/50">
                    ({count} פריטים)
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                aria-label="סגירה"
                className="rounded-full p-1.5 text-charcoal transition hover:bg-sand"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="font-serif text-2xl text-ink">העגלה ריקה</p>
                <p className="max-w-xs text-sm text-charcoal/60">
                  עדיין לא הוספת פריטים. בואו נמצא משהו יפה.
                </p>
                <Button href="/shop" variant="outline" onClick={closeCart}>
                  לעיון באוסף
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-charcoal/10 overflow-auto px-6">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-5">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeCart}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-sand"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={closeCart}
                            className="font-serif text-base leading-snug text-ink hover:text-copper"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.productId)}
                            aria-label="הסרה"
                            className="text-charcoal/40 transition hover:text-terracotta"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-sm text-charcoal/60">
                          {formatPrice(item.price)}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-charcoal/20">
                            <button
                              onClick={() =>
                                setQuantity(item.productId, item.quantity - 1)
                              }
                              aria-label="הפחתה"
                              className="p-1.5 text-charcoal hover:text-ink"
                            >
                              <MinusIcon className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2ch] text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                setQuantity(item.productId, item.quantity + 1)
                              }
                              aria-label="הוספה"
                              className="p-1.5 text-charcoal hover:text-ink disabled:opacity-30"
                              disabled={item.quantity >= item.stockCount}
                            >
                              <PlusIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-charcoal">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-charcoal/10 px-6 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal/70">סכום ביניים</span>
                    <span className="font-serif text-xl text-ink">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal/50">
                    דמי המשלוח מחושבים בקופה.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button href="/cart" onClick={closeCart} className="w-full">
                      מעבר לעגלה
                    </Button>
                    <Button
                      href="/cart"
                      variant="outline"
                      onClick={closeCart}
                      className="w-full"
                    >
                      המשך קנייה
                    </Button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
