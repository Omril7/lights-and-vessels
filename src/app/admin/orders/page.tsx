import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  STATUS_TONES,
  type OrderStatus,
} from "@/lib/orders";
import { OrdersFilterBar, buildOrdersHref } from "@/components/admin/OrdersFilterBar";

export const dynamic = "force-dynamic";
export const metadata = { title: "הזמנות" };

const PAGE_SIZE = 30;

type SearchParams = { q?: string; status?: string; page?: string };

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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status ?? "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } },
      { customerEmail: { contains: q } },
    ];
  }

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const filtersActive = q !== "" || status !== "all";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">ניהול</p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">הזמנות</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {filtersActive ? `${total} תוצאות` : `סה״כ ${total} הזמנות`}
        </p>
      </header>

      <OrdersFilterBar
        initialQ={q}
        initialStatus={status}
        filtersActive={filtersActive}
      />

      <section className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-charcoal/50">
            {filtersActive ? (
              <>אין תוצאות תואמות. <Link href="/admin/orders" className="text-copper hover:underline">ניקוי המסננים</Link></>
            ) : (
              "אין עדיין הזמנות."
            )}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linen/60 text-xs uppercase tracking-wider2 text-charcoal/60">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">מס׳</th>
                  <th className="px-4 py-3 text-start font-medium">תאריך</th>
                  <th className="px-4 py-3 text-start font-medium">לקוח/ה</th>
                  <th className="px-4 py-3 text-start font-medium">אימייל</th>
                  <th className="px-4 py-3 text-start font-medium">סטטוס</th>
                  <th className="px-4 py-3 text-end font-medium">סה״כ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-charcoal/5 hover:bg-linen/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-charcoal hover:text-copper">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-charcoal/80">{o.customerName}</td>
                    <td className="px-4 py-3 text-charcoal/60" dir="ltr">{o.customerEmail}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONES[o.status as OrderStatus] ?? "neutral"}>
                        {STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end font-medium text-charcoal">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-end">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal">
                        פרטים
                        <ChevronLeftIcon className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 border-t border-charcoal/10 bg-linen/40 px-4 py-3 text-sm">
            <p className="text-charcoal/60">עמוד {safePage} מתוך {totalPages}</p>
            <div className="flex items-center gap-1">
              <PageLink params={searchParams} target={safePage - 1} disabled={safePage <= 1} aria-label="עמוד קודם">
                <ChevronRightIcon className="h-4 w-4" aria-hidden />
              </PageLink>
              {pageNumbers(safePage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`gap-${i}`} className="px-2 text-charcoal/40" aria-hidden>…</span>
                ) : (
                  <PageLink key={n} params={searchParams} target={n} active={n === safePage}>{n}</PageLink>
                )
              )}
              <PageLink params={searchParams} target={safePage + 1} disabled={safePage >= totalPages} aria-label="עמוד הבא">
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
    active ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-charcoal/[0.06]",
    disabled && "pointer-events-none opacity-30"
  );
  if (disabled) return <span className={className} {...rest}>{children}</span>;
  return (
    <Link
      href={buildOrdersHref({ ...params, page: String(target) })}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
