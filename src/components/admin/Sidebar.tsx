"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

const nav = [
  { href: "/admin", label: "לוח בקרה", icon: HomeIcon, exact: true },
  { href: "/admin/products", label: "מוצרים", icon: ShoppingBagIcon },
  { href: "/admin/orders", label: "הזמנות", icon: ClipboardDocumentListIcon },
  { href: "/admin/documents", label: "מסמכים", icon: DocumentDuplicateIcon },
  { href: "/admin/reports", label: "דוחות", icon: ChartBarIcon },
  { href: "/admin/site-content", label: "תוכן האתר", icon: DocumentTextIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:end-0 border-s border-charcoal/10 bg-cream/95 backdrop-blur">
      <div className="px-6 py-6 border-b border-charcoal/10">
        <Link href="/admin" className="block">
          <p className="font-serif text-xl text-charcoal leading-none">סטודיו</p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-wider2 text-charcoal/50">
            ניהול
          </p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-charcoal text-cream"
                  : "text-charcoal/80 hover:bg-charcoal/[0.06]"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-charcoal/10 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-charcoal/70 hover:bg-charcoal/[0.06]"
        >
          <ArrowUturnRightIcon className="h-5 w-5 shrink-0" aria-hidden />
          <span>חזרה לאתר</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-charcoal/70 hover:bg-terracotta/10 hover:text-terracotta"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden />
          <span>התנתקות</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileTopbar() {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-charcoal/10 bg-cream/95 px-4 py-3 backdrop-blur">
      <Link href="/admin" className="font-serif text-lg text-charcoal">
        סטודיו · ניהול
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="text-xs text-charcoal/70 hover:text-terracotta"
      >
        התנתקות
      </button>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-charcoal/10 bg-cream/95 backdrop-blur">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2.5 text-[0.65rem]",
              active ? "text-charcoal" : "text-charcoal/50"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
