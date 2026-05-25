import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  STATUS_TONES,
  type OrderStatus,
} from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "הזמנות" };

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "הכול" },
  ...ORDER_STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s] })),
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const active = searchParams.status || "all";
  const where =
    active && active !== "all" ? { status: active } : undefined;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          ניהול
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">הזמנות</h1>
      </header>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              active === f.key
                ? "bg-charcoal text-cream"
                : "border border-charcoal/15 text-charcoal/70 hover:bg-charcoal/[0.05]"
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <section className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-charcoal/50">
            אין הזמנות בקטגוריה הזו.
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
                  <tr
                    key={o.id}
                    className="border-t border-charcoal/5 hover:bg-linen/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-charcoal hover:text-copper"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-charcoal/80">
                      {o.customerName}
                    </td>
                    <td className="px-4 py-3 text-charcoal/60" dir="ltr">
                      {o.customerEmail}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          STATUS_TONES[o.status as OrderStatus] ?? "neutral"
                        }
                      >
                        {STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end font-medium text-charcoal">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
                      >
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
      </section>
    </div>
  );
}
