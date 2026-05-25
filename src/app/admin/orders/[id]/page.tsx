import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  STATUS_LABELS,
  STATUS_TONES,
  type OrderStatus,
} from "@/lib/orders";
import { OrderControls } from "@/components/admin/OrderControls";
import { PaymentBlock } from "@/components/admin/PaymentBlock";

export const dynamic = "force-dynamic";

type Address = {
  street?: string;
  city?: string;
  zip?: string;
  // legacy fields from earlier seed data
  line1?: string;
  line2?: string;
  postal_code?: string;
  country?: string;
};

function parseAddress(raw: string): Address {
  try {
    return JSON.parse(raw) as Address;
  } catch {
    return {};
  }
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const status = order.status as OrderStatus;
  const address = parseAddress(order.shippingAddress);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
            <Link href="/admin/orders" className="hover:text-charcoal">
              הזמנות
            </Link>
          </p>
          <h1 className="mt-1 font-serif text-3xl text-charcoal">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            התקבלה ב־{formatDate(order.createdAt)}
          </p>
        </div>
        <Badge tone={STATUS_TONES[status] ?? "neutral"}>
          {STATUS_LABELS[status] ?? order.status}
        </Badge>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
            <header className="px-5 py-4 border-b border-charcoal/10">
              <h2 className="font-serif text-lg text-charcoal">פריטים</h2>
            </header>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-charcoal/5 first:border-t-0"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/products/${item.productId}/edit`}
                        className="text-charcoal hover:text-copper"
                      >
                        {item.product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-charcoal/60 text-end">
                      ×{item.quantity}
                    </td>
                    <td className="px-5 py-3 text-end text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-linen/60">
                <tr>
                  <td colSpan={2} className="px-5 py-2 text-end text-charcoal/60">
                    סכום ביניים
                  </td>
                  <td className="px-5 py-2 text-end text-charcoal">
                    {formatPrice(order.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-5 py-2 text-end text-charcoal/60">
                    משלוח
                  </td>
                  <td className="px-5 py-2 text-end text-charcoal">
                    {formatPrice(order.shippingCost)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-5 py-3 text-end font-medium text-charcoal">
                    סה״כ
                  </td>
                  <td className="px-5 py-3 text-end font-serif text-lg text-charcoal">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">פרטי לקוח/ה</h2>
            <dl className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">
                  שם
                </dt>
                <dd className="text-charcoal">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">
                  אימייל
                </dt>
                <dd className="text-charcoal" dir="ltr">
                  {order.customerEmail}
                </dd>
              </div>
              {order.phone && (
                <div>
                  <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">
                    טלפון
                  </dt>
                  <dd className="text-charcoal" dir="ltr">
                    {order.phone}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">
                  שיטת משלוח
                </dt>
                <dd className="text-charcoal">
                  {order.shippingMethod === "pickup" ? "איסוף עצמי" : "דואר ישראל"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wider2 text-charcoal/50">
                  כתובת למשלוח
                </dt>
                <dd className="text-charcoal whitespace-pre-line">
                  {order.shippingMethod === "pickup"
                    ? "—"
                    : [address.street ?? address.line1, address.line2, address.city, address.zip ?? address.postal_code, address.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-6 h-fit">
          <PaymentBlock
            orderId={order.id}
            total={order.total}
            paidAt={order.paidAt}
            documentNumber={order.morningDocumentNumber}
            documentUrl={order.morningDocumentUrl}
            customerEmail={order.customerEmail}
            status={order.status}
          />
          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal mb-4">פעולות</h2>
            <OrderControls
              id={order.id}
              initialStatus={status}
              initialNotes={order.notes ?? ""}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
