import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getIncomeReport } from "@/lib/morning";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ClockIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתינה",
  confirmed: "אושרה",
  shipped: "נשלחה",
  delivered: "נמסרה",
  cancelled: "בוטלה",
};

const STATUS_TONES: Record<string, "neutral" | "accent" | "sale" | "soldout"> = {
  pending: "accent",
  confirmed: "neutral",
  shipped: "neutral",
  delivered: "neutral",
  cancelled: "sale",
};

export default async function AdminDashboard() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [productCount, orderCount, pendingCount, dbRevenue, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: monthStart },
          status: { not: "cancelled" },
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  // Prefer Morning's authoritative revenue (matches the artist's books).
  // Fall back to DB sum when Morning isn't configured or unreachable.
  let monthRevenueAmount = dbRevenue._sum.total ?? 0;
  let revenueSource: "morning" | "db" = "db";
  try {
    const today = new Date();
    const report = await getIncomeReport({
      from: monthStart.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
    });
    const sum = (report.rows ?? []).reduce((acc, r) => acc + r.amount, 0);
    if (sum > 0 || (report.rows && report.rows.length > 0)) {
      monthRevenueAmount = sum;
      revenueSource = "morning";
    }
  } catch (err) {
    console.warn("[dashboard] Morning revenue fetch failed, using DB fallback:", err);
  }

  const stats = [
    {
      label: "מוצרים",
      value: productCount.toString(),
      icon: ShoppingBagIcon,
    },
    {
      label: "הזמנות",
      value: orderCount.toString(),
      icon: ClipboardDocumentListIcon,
    },
    {
      label: "הזמנות ממתינות",
      value: pendingCount.toString(),
      icon: ClockIcon,
    },
    {
      label: revenueSource === "morning" ? "הכנסות החודש (מורנינג)" : "הכנסות החודש",
      value: formatPrice(monthRevenueAmount),
      icon: BanknotesIcon,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
            לוח בקרה
          </p>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl text-charcoal">
            ברוך הבא
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/products/new" size="sm">
            הוספת מוצר
          </Button>
          <Button href="/admin/orders" size="sm" variant="outline">
            לכל ההזמנות
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-charcoal/10 bg-cream p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
                  {stat.label}
                </p>
                <Icon className="h-5 w-5 text-charcoal/40" aria-hidden />
              </div>
              <p className="mt-3 font-serif text-2xl md:text-3xl text-charcoal">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-charcoal/10">
          <h2 className="font-serif text-xl text-charcoal">הזמנות אחרונות</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
          >
            הצגת הכול
            <ChevronLeftIcon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </header>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-charcoal/50">
            עדיין אין הזמנות.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linen/60 text-xs uppercase tracking-wider2 text-charcoal/60">
                <tr>
                  <th className="px-5 py-3 text-start font-medium">מס׳</th>
                  <th className="px-5 py-3 text-start font-medium">תאריך</th>
                  <th className="px-5 py-3 text-start font-medium">לקוח/ה</th>
                  <th className="px-5 py-3 text-start font-medium">סטטוס</th>
                  <th className="px-5 py-3 text-end font-medium">סה״כ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-charcoal/5 hover:bg-linen/40"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-charcoal hover:text-copper"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-charcoal/70">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-charcoal/80">
                      {o.customerName}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONES[o.status] ?? "neutral"}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-end font-medium text-charcoal">
                      {formatPrice(o.total)}
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
