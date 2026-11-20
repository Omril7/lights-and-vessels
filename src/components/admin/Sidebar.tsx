"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { CONTENT_GROUPS } from "@/lib/site-content-schema";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  NewspaperIcon,
  PhotoIcon,
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronLeftIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Icon = React.ComponentType<{ className?: string }>;
type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  exact?: boolean;
  /** Shown nested under the item while you're inside it. */
  children?: { href: string; label: string }[];
};
type NavSection = { label: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    label: "ראשי",
    items: [{ href: "/admin", label: "לוח בקרה", icon: HomeIcon, exact: true }],
  },
  {
    label: "חנות",
    items: [
      {
        href: "/admin/products",
        label: "מוצרים",
        icon: ShoppingBagIcon,
        children: [
          { href: "/admin/products", label: "כל המוצרים" },
          { href: "/admin/products/new", label: "מוצר חדש" },
          { href: "/admin/products/categories", label: "קטגוריות" },
          { href: "/admin/products/tags", label: "תגיות" },
        ],
      },
      { href: "/admin/orders", label: "הזמנות", icon: ClipboardDocumentListIcon },
    ],
  },
  {
    label: "תוכן",
    items: [
      {
        href: "/admin/site-content",
        label: "עמודי האתר",
        icon: DocumentTextIcon,
        children: CONTENT_GROUPS.map((g) => ({
          href: `/admin/site-content/${g.id}`,
          label: g.label,
        })),
      },
      { href: "/admin/gallery", label: "גלריה", icon: PhotoIcon },
      { href: "/admin/blog", label: "בלוג", icon: NewspaperIcon },
    ],
  },
  {
    label: "כספים",
    items: [
      { href: "/admin/documents", label: "מסמכים", icon: DocumentDuplicateIcon },
      { href: "/admin/reports", label: "דוחות", icon: ChartBarIcon },
    ],
  },
];

const isWithin = (pathname: string, item: NavItem) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

/** The sectioned navigation — shared by the desktop sidebar and the mobile drawer. */
function AdminNav({ email, onNavigate }: { email?: string | null; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  // Manual open/closed state per parent item; unset = follow the current route.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (href: string, isOpen: boolean) =>
    setOpen((prev) => ({ ...prev, [href]: !isOpen }));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-charcoal/10 px-5 py-5">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <Image
            src="/logo-2169x1282-black.png"
            alt="אורות וכלים"
            width={64}
            height={38}
            className="brand-logo h-8 w-auto"
          />
          <span className="text-sm text-charcoal/70">ניהול</span>
        </Link>
      </div>

      <nav aria-label="ניווט ניהול" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-3 pb-1.5 text-xs text-charcoal/50">{section.label}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const within = isWithin(pathname, item);
                const exactHere = item.children ? pathname === item.href : within;
                // Children open automatically inside the section; the arrow overrides.
                const expanded = item.children ? (open[item.href] ?? within) : false;
                const listId = `nav-children-${item.href.replace(/\W+/g, "-")}`;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <div
                      className={cn(
                        "flex items-center transition-colors",
                        within && !item.children
                          ? "bg-ink text-cream"
                          : within
                            ? "font-medium text-ink"
                            : "text-charcoal/80 hover:bg-charcoal/[0.06]"
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={exactHere ? "page" : undefined}
                        className="flex flex-1 items-center gap-3 px-3 py-2.5 text-sm"
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          onClick={() => toggle(item.href, expanded)}
                          aria-expanded={expanded}
                          aria-controls={listId}
                          aria-label={`${expanded ? "סגירת" : "פתיחת"} ${item.label}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center text-charcoal/50 transition-colors hover:text-ink"
                        >
                          <ChevronLeftIcon
                            aria-hidden
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              expanded && "-rotate-90"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {item.children && expanded && (
                      <ul id={listId} className="mb-1 ms-[1.4rem] border-s border-charcoal/15 py-1">
                        {item.children.map((c) => {
                          const on = pathname === c.href;
                          return (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={onNavigate}
                                aria-current={on ? "page" : undefined}
                                className={cn(
                                  "-ms-px block border-s-2 py-1.5 ps-4 text-sm transition-colors",
                                  on
                                    ? "border-ink font-medium text-ink"
                                    : "border-transparent text-charcoal/70 hover:text-ink"
                                )}
                              >
                                {c.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-charcoal/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-charcoal/80 transition-colors hover:bg-charcoal/[0.06]"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5 shrink-0" aria-hidden />
          צפייה באתר
        </a>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-charcoal/80 transition-colors hover:bg-accent/10 hover:text-accent"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden />
          התנתקות
        </button>
        {email && (
          <p className="truncate px-3 pt-2 text-xs text-charcoal/45" dir="ltr">
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

/** Desktop: fixed on the start side (the right, in Hebrew). */
export function Sidebar({ email }: { email?: string | null }) {
  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-charcoal/10 bg-cream md:block">
      <AdminNav email={email} />
    </aside>
  );
}

/** Mobile: top bar with the menu button; the menu is the same sidebar, as a drawer. */
export function MobileTopbar({ email }: { email?: string | null }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  // Close on navigation and on Escape; lock page scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const current =
    NAV.flatMap((s) => s.items).find((i) => isWithin(pathname, i))?.label ?? "ניהול";

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-charcoal/10 bg-cream px-2 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="תפריט"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center text-ink"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <p className="flex-1 truncate font-serif text-lg text-ink">{current}</p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center gap-1.5 px-2 text-sm text-charcoal/80"
        >
          לאתר
          <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
        </a>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="תפריט ניהול">
          <button
            type="button"
            aria-label="סגירת התפריט"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-y-0 start-0 w-[min(20rem,85vw)] bg-cream">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירה"
              className="absolute end-2 top-3 z-10 flex h-10 w-10 items-center justify-center text-charcoal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <AdminNav email={email} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
