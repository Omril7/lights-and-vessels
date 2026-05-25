"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart, cartSubtotal } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

type ShippingConfig = {
  postPrice: number;
  freeOver: number; // 0 = no free-shipping threshold
  postEta: string;
  pickupAddress: string;
  pickupHours: string;
};

type ShippingMethod = "post" | "pickup";

export function CheckoutForm({ shipping }: { shipping: ShippingConfig }) {
  const router = useRouter();
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [method, setMethod] = useState<ShippingMethod>("post");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const shippingCost =
    method === "pickup"
      ? 0
      : shipping.freeOver > 0 && subtotal >= shipping.freeOver
      ? 0
      : shipping.postPrice;
  const total = subtotal + shippingCost;

  if (!mounted) return <div className="min-h-[40vh]" />;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-charcoal/15 bg-linen p-10 text-center">
        <p className="text-charcoal/70">העגלה ריקה.</p>
        <Button href="/shop" className="mt-4">
          לעיון באוסף
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("נא למלא שם, אימייל וטלפון");
      return;
    }
    if (method === "post" && (!street.trim() || !city.trim())) {
      toast.error("נא למלא כתובת למשלוח");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
          shippingMethod: method,
          shippingAddress:
            method === "post"
              ? { street: street.trim(), city: city.trim(), zip: zip.trim() }
              : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.redirectUrl) {
        throw new Error(data?.error || "תקלה ביצירת תשלום");
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "תקלה ביצירת תשלום");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section>
          <h2 className="mb-4 font-serif text-2xl text-ink">פרטי קשר</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input id="name" label="שם מלא" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            <Input id="email" label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input id="phone" label="טלפון" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-serif text-2xl text-ink">שיטת משלוח</h2>
          <div className="grid gap-3">
            <ShippingOption
              checked={method === "post"}
              onChange={() => setMethod("post")}
              title="דואר ישראל"
              subtitle={shipping.postEta}
              price={
                shipping.freeOver > 0 && subtotal >= shipping.freeOver
                  ? "חינם"
                  : formatPrice(shipping.postPrice)
              }
            />
            <ShippingOption
              checked={method === "pickup"}
              onChange={() => setMethod("pickup")}
              title="איסוף עצמי"
              subtitle={shipping.pickupAddress ? shipping.pickupAddress : "תיאום באמצעות וואטסאפ לאחר ההזמנה"}
              price="חינם"
            />
          </div>
        </section>

        {method === "post" && (
          <section>
            <h2 className="mb-4 font-serif text-2xl text-ink">כתובת למשלוח</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="street" label="רחוב ומספר" value={street} onChange={(e) => setStreet(e.target.value)} required autoComplete="street-address" />
              <Input id="city" label="עיר" value={city} onChange={(e) => setCity(e.target.value)} required autoComplete="address-level2" />
              <Input id="zip" label="מיקוד (לא חובה)" value={zip} onChange={(e) => setZip(e.target.value)} autoComplete="postal-code" />
            </div>
          </section>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-charcoal/15 bg-linen p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl text-ink">סיכום</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2 text-charcoal/80">
              <span>{i.name} × {i.quantity}</span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-charcoal/15 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-charcoal/70">סכום ביניים</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal/70">משלוח</dt>
            <dd>{shippingCost === 0 ? "חינם" : formatPrice(shippingCost)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-charcoal/15 pt-4">
          <span className="font-serif text-lg text-ink">סך הכול</span>
          <span className="font-serif text-2xl text-ink">{formatPrice(total)}</span>
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "מעבר לתשלום…" : "לתשלום מאובטח"}
        </Button>
        <p className="mt-3 text-center text-xs text-charcoal/50">
          התשלום מתבצע באתר מאובטח של Morning. לא נשמרים פרטי כרטיס אצלנו.{" "}
          <a
            href="https://www.greeninvoice.co.il/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-copper underline-offset-2 hover:underline"
          >
            מידע נוסף
          </a>
        </p>
      </aside>
    </form>
  );
}

function ShippingOption({
  checked,
  onChange,
  title,
  subtitle,
  price,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
  price: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        checked ? "border-copper bg-cream" : "border-charcoal/20 bg-cream/40 hover:border-charcoal/40"
      }`}
    >
      <input
        type="radio"
        name="shipping"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-copper"
      />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-ink">{title}</span>
          <span className="text-sm text-charcoal/80">{price}</span>
        </div>
        <p className="mt-0.5 text-xs text-charcoal/60">{subtitle}</p>
      </div>
    </label>
  );
}
