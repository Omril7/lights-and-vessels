import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  PencilSquareIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { formatPrice, cn } from "@/lib/utils";
import { categoryLabel } from "@/types";
import { ProductsFilterBar } from "@/components/admin/ProductsFilterBar";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type SearchParams = {
  q?: string;
  category?: string;
  status?: string;
  page?: string;
};

function buildHref(base: SearchParams, override: SearchParams): string {
  const merged: SearchParams = { ...base, ...override };
  const params = new URLSearchParams();
  Object.entries(merged).forEach(([k, v]) => {
    if (v && v !== "all") params.set(k, v);
  });
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim();
  const category = searchParams.category ?? "all";
  const status = searchParams.status ?? "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { slug: { contains: q } },
      { tags: { contains: q } },
    ];
  }
  if (category && category !== "all") where.category = category;
  if (status === "published") where.published = true;
  if (status === "draft") where.published = false;
  if (status === "featured") where.featured = true;
  if (status === "soldout") {
    where.OR = [
      ...(Array.isArray(where.OR) ? (where.OR as object[]) : []),
      { inStock: false },
      { stockCount: { lte: 0 } },
    ];
  }

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const filtersActive =
    q !== "" || category !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
            ניהול
          </p>
          <h1 className="mt-1 font-serif text-3xl text-charcoal">מוצרים</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {filtersActive
              ? `${total} תוצאות`
              : `סה״כ ${total} פריטים`}
          </p>
        </div>
        <Button href="/admin/products/new" size="sm">
          <PlusIcon className="h-4 w-4" aria-hidden />
          הוספת מוצר
        </Button>
      </header>

      <ProductsFilterBar
        initialQ={q}
        initialCategory={category}
        initialStatus={status}
        filtersActive={filtersActive}
      />

      <section className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        {products.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-charcoal/50">
            {filtersActive ? (
              <>אין תוצאות תואמות. <Link href="/admin/products" className="text-copper hover:underline">ניקוי המסננים</Link></>
            ) : (
              <>אין עדיין מוצרים. <Link href="/admin/products/new" className="text-copper hover:underline">להוסיף את הראשון</Link>.</>
            )}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linen/60 text-xs uppercase tracking-wider2 text-charcoal/60">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">תמונה</th>
                  <th className="px-4 py-3 text-start font-medium">שם</th>
                  <th className="px-4 py-3 text-start font-medium">קטגוריה</th>
                  <th className="px-4 py-3 text-end font-medium">מחיר</th>
                  <th className="px-4 py-3 text-end font-medium">מלאי</th>
                  <th className="px-4 py-3 text-start font-medium">סטטוס</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = p.images[0]?.url;
                  const soldOut = !p.inStock || p.stockCount <= 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-charcoal/5 hover:bg-linen/40"
                    >
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-linen">
                          {img && (
                            <Image
                              src={img}
                              alt={p.name_he}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized={img.startsWith("/api/uploads/")}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="font-medium text-charcoal hover:text-copper"
                        >
                          {p.name_he}
                        </Link>
                        <p className="text-xs text-charcoal/40" dir="ltr">
                          /{p.slug}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-charcoal/80">
                        {p.category ? categoryLabel(p.category) : "—"}
                      </td>
                      <td className="px-4 py-3 text-end text-charcoal">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {soldOut ? (
                          <span className="text-terracotta">אזל</span>
                        ) : (
                          <span className="text-charcoal/70">{p.stockCount}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.published ? (
                            <Badge tone="neutral">פעיל</Badge>
                          ) : (
                            <Badge tone="accent">טיוטה</Badge>
                          )}
                          {p.featured && <Badge tone="accent">מומלץ</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
                          aria-label="עריכת מוצר"
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-hidden />
                          עריכה
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 border-t border-charcoal/10 bg-linen/40 px-4 py-3 text-sm">
            <p className="text-charcoal/60">
              עמוד {safePage} מתוך {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <PageLink
                params={searchParams}
                target={safePage - 1}
                disabled={safePage <= 1}
                aria-label="עמוד קודם"
              >
                <ChevronRightIcon className="h-4 w-4" aria-hidden />
              </PageLink>
              {pageNumbers(safePage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span
                    key={`gap-${i}`}
                    className="px-2 text-charcoal/40"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <PageLink
                    key={n}
                    params={searchParams}
                    target={n}
                    active={n === safePage}
                  >
                    {n}
                  </PageLink>
                )
              )}
              <PageLink
                params={searchParams}
                target={safePage + 1}
                disabled={safePage >= totalPages}
                aria-label="עמוד הבא"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden />
              </PageLink>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}

function PageLink({
  params,
  target,
  active,
  disabled,
  children,
  ...rest
}: {
  params: SearchParams;
  target: number;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  const className = cn(
    "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm transition-colors",
    active
      ? "bg-charcoal text-cream"
      : "text-charcoal/70 hover:bg-charcoal/[0.06]",
    disabled && "pointer-events-none opacity-30"
  );
  if (disabled) {
    return (
      <span className={className} {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={buildHref(params, { page: String(target) })}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** [1, …, current-1, current, current+1, …, last] with bounds. */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
