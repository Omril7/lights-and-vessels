import { Resend } from "resend";
import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/utils";
import { getSiteContent } from "@/lib/content";
import type { Order, OrderItem, Product } from "@prisma/client";

const FROM_NAME = process.env.EMAIL_FROM_NAME || "אורות וכלים";
const STUDIO_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function resolveProvider(): Promise<"resend" | "gmail"> {
  try {
    const content = await getSiteContent();
    if (content.email_use_gmail === "true") return "gmail";
    return "resend";
  } catch {
    // DB unreachable — fall back to env, then resend.
    return (process.env.EMAIL_PROVIDER || "resend").toLowerCase() === "gmail"
      ? "gmail"
      : "resend";
  }
}

type OrderWithItems = Order & {
  items: (OrderItem & { product: Pick<Product, "name_he" | "name_en" | "slug"> })[];
};

type SendArgs = { to: string; subject: string; html: string };

export async function sendViaResend(args: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "..." || key === "") {
    console.warn("[email] RESEND_API_KEY missing; skipping send");
    return false;
  }
  const from = `${FROM_NAME} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`;
  try {
    await new Resend(key).emails.send({ from, to: [args.to], subject: args.subject, html: args.html });
    return true;
  } catch (err) {
    console.error("[email] Resend send failed:", err);
    return false;
  }
}

export async function sendViaGmail(args: SendArgs): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[email] GMAIL_USER / GMAIL_APP_PASSWORD missing; skipping send");
    return false;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${user}>`,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    return true;
  } catch (err) {
    console.error("[email] Gmail SMTP send failed:", err);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  order: OrderWithItems,
  ctx: { pickupAddress?: string; pickupHours?: string; shippingEta?: string },
  locale = "he",
): Promise<void> {
  const l = getLang(locale);
  const args: SendArgs = {
    to: order.customerEmail,
    subject: l.subject(order.orderNumber),
    html: renderConfirmationHtml(order, ctx, locale),
  };
  const provider = await resolveProvider();
  const sent =
    provider === "gmail" ? await sendViaGmail(args) : await sendViaResend(args);
  if (!sent) {
    console.warn(`[email] confirmation skipped for order ${order.orderNumber} (provider=${provider})`);
  }
}

export async function sendAdminOrderNotificationEmail(
  order: OrderWithItems,
): Promise<void> {
  const recipients = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (recipients.length === 0) {
    console.warn(`[email] admin notification skipped for order ${order.orderNumber} (ADMIN_EMAILS empty)`);
    return;
  }
  const subject = `הזמנה חדשה ${order.orderNumber} — ${formatPrice(order.total)}`;
  const html = renderAdminNotificationHtml(order);
  const provider = await resolveProvider();
  for (const to of recipients) {
    const sent =
      provider === "gmail"
        ? await sendViaGmail({ to, subject, html })
        : await sendViaResend({ to, subject, html });
    if (!sent) {
      console.warn(`[email] admin notification to ${to} skipped for order ${order.orderNumber} (provider=${provider})`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Email design tokens + shared shell
 * ------------------------------------------------------------------ */

const C = {
  page: "#ece2d4", // parchment page background
  card: "#fffdf8", // warm near-white card
  ink: "#2d251c", // body text
  heading: "#3b2f24", // serif headings
  muted: "#7e6e5c", // secondary text
  faint: "#a7967f", // tertiary / labels
  border: "#ece2d4", // hairlines
  soft: "#f5eee2", // tinted info boxes
  accent: "#a8623a", // terracotta accent
  dark: "#3b352d", // dark button
  onDark: "#f7f1e6", // text on dark button
};

const SERIF = "'Frank Ruhl Libre', 'Times New Roman', Georgia, serif";
const SANS = "'Assistant', 'Segoe UI', Arial, sans-serif";

const L = {
  he: {
    lang: "he", dir: "rtl",
    brand: "אורות וכלים",
    tagline: "נוצר ביד במנות קטנות · אורות וכלים",
    subtotal: "סכום ביניים", shipping: "משלוח", free: "חינם", total: "סך הכול",
    subject: (n: string) => `הזמנה ${n} התקבלה — אורות וכלים`,
    preheader: (n: string) => `הזמנה ${n} התקבלה — מתחיל להכין`,
    greeting: (name: string) => `תודה, ${name}`,
    body: (n: string, ink: string) => `קיבלתי את הזמנתך <strong style="color:${ink};">${n}</strong>. כל פריט נוצר ביד — אתחיל להכין עכשיו.`,
    pickup: "איסוף עצמי", shippingLabel: "משלוח",
    pickupAddrFallback: "כתובת תיאום באמצעות וואטסאפ",
    pickupHoursFallback: "ניצור איתך קשר לתיאום שעה",
    postSub: (eta: string) => `דואר ישראל · ${eta}`,
    postEtaDefault: "עד 7 ימי עסקים",
    receiptBtn: "הורד קבלה (PDF)",
    footerNote: "לכל שאלה אפשר פשוט להשיב למייל הזה — אני קורא כל הודעה בעצמי.",
  },
  en: {
    lang: "en", dir: "ltr",
    brand: "Lights and Vessels",
    tagline: "Handcrafted in small batches · Lights and Vessels",
    subtotal: "Subtotal", shipping: "Shipping", free: "Free", total: "Total",
    subject: (n: string) => `Order ${n} received — Lights and Vessels`,
    preheader: (n: string) => `Order ${n} received — starting to prepare`,
    greeting: (name: string) => `Thank you, ${name}`,
    body: (n: string, ink: string) => `I received your order <strong style="color:${ink};">${n}</strong>. Each piece is handcrafted — I'll start preparing yours now.`,
    pickup: "Pickup", shippingLabel: "Shipping",
    pickupAddrFallback: "Address to be coordinated via WhatsApp",
    pickupHoursFallback: "We'll contact you to arrange a time",
    postSub: (eta: string) => `Israel Post · ${eta}`,
    postEtaDefault: "Up to 7 business days",
    receiptBtn: "Download receipt (PDF)",
    footerNote: "For any question, simply reply to this email — I read every message myself.",
  },
} as const;

function getLang(loc: string) {
  return loc === "en" ? L.en : L.he;
}

/** Wraps inner card content in a full, responsive email document. */
function emailShell(opts: { preheader: string; content: string; locale?: string }): string {
  const l = getLang(opts.locale ?? "he");
  const site = STUDIO_URL.replace(/\/$/, "");
  const siteLabel = site.replace(/^https?:\/\//, "");
  return `<!doctype html>
<html lang="${l.lang}" dir="${l.dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(l.brand)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Frank+Ruhl+Libre:wght@500;700&display=swap');
  body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse !important; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { color:${C.accent}; }
  @media only screen and (max-width:600px) {
    .container { width:100% !important; }
    .px { padding-left:24px !important; padding-right:24px !important; }
    .h1 { font-size:26px !important; line-height:1.25 !important; }
    .btn a { display:block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
  <div dir="${l.dir}" style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.page};">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" dir="${l.dir}" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};">
    <tr>
      <td align="center" style="padding:30px 12px;">

        <!-- masthead -->
        <table role="presentation" dir="${l.dir}" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
          <tr>
            <td align="center" style="padding:4px 0 24px;">
              <div style="font-family:${SERIF};font-size:23px;font-weight:500;letter-spacing:1px;color:${C.heading};">${escapeHtml(l.brand)}</div>
              <div style="width:48px;height:1px;background:${C.accent};margin:13px auto 0;"></div>
            </td>
          </tr>
        </table>

        <!-- card -->
        <table role="presentation" dir="${l.dir}" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:${C.card};border:1px solid ${C.border};border-radius:18px;">
          ${opts.content}
        </table>

        <!-- footer -->
        <table role="presentation" dir="${l.dir}" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
          <tr>
            <td align="center" style="padding:24px 24px 6px;font-family:${SANS};font-size:12px;line-height:1.8;color:${C.faint};">
              <a href="${site}" style="color:${C.muted};text-decoration:none;">${escapeHtml(siteLabel)}</a><br>
              ${escapeHtml(l.tagline)}
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** A label → value row used in the info tables. */
function infoRow(label: string, value: string, opts?: { top?: boolean }): string {
  const valign = opts?.top ? "vertical-align:top;" : "";
  return `<tr>
    <td style="padding:5px 0 5px 12px;font-family:${SANS};font-size:14px;color:${C.faint};white-space:nowrap;${valign}">${escapeHtml(label)}</td>
    <td style="padding:5px 0;font-family:${SANS};font-size:14px;color:${C.ink};">${value}</td>
  </tr>`;
}

/** Items + subtotal/shipping/total summary table shared by both emails. */
function summaryTable(order: OrderWithItems, loc = "he"): string {
  const l = getLang(loc);
  const priceAlign = l.dir === "rtl" ? "left" : "right";
  const items = order.items
    .map((i) => {
      const name = (loc === "en" && i.product.name_en) ? i.product.name_en : i.product.name_he;
      return `
        <tr>
          <td style="padding:13px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:15px;color:${C.ink};">${escapeHtml(name)} <span style="color:${C.faint};">× ${i.quantity}</span></td>
          <td align="${priceAlign}" style="padding:13px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:15px;color:${C.ink};white-space:nowrap;">${formatPrice(i.price * i.quantity)}</td>
        </tr>`;
    })
    .join("");
  return `<table role="presentation" dir="${l.dir}" width="100%" cellpadding="0" cellspacing="0">
    ${items}
    <tr>
      <td style="padding:14px 0 4px;font-family:${SANS};font-size:14px;color:${C.muted};">${escapeHtml(l.subtotal)}</td>
      <td align="${priceAlign}" style="padding:14px 0 4px;font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;">${formatPrice(order.subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-family:${SANS};font-size:14px;color:${C.muted};">${escapeHtml(l.shipping)}</td>
      <td align="${priceAlign}" style="padding:4px 0;font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;">${order.shippingCost > 0 ? formatPrice(order.shippingCost) : escapeHtml(l.free)}</td>
    </tr>
    <tr>
      <td style="padding:13px 0 0;border-top:2px solid ${C.heading};font-family:${SANS};font-size:17px;font-weight:700;color:${C.heading};">${escapeHtml(l.total)}</td>
      <td align="${priceAlign}" style="padding:13px 0 0;border-top:2px solid ${C.heading};font-family:${SANS};font-size:17px;font-weight:700;color:${C.heading};white-space:nowrap;">${formatPrice(order.total)}</td>
    </tr>
  </table>`;
}

/** Pill-shaped CTA button (bulletproof-ish, table-based). */
function button(href: string, label: string): string {
  return `<table role="presentation" dir="rtl" class="btn" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="border-radius:999px;background:${C.dark};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 30px;font-family:${SANS};font-size:15px;font-weight:600;color:${C.onDark};text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export async function sendAdminLowStockEmail(
  outOfStockProducts: { name_he: string; slug: string }[],
): Promise<void> {
  if (outOfStockProducts.length === 0) return;
  const recipients = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (recipients.length === 0) return;
  const subject =
    outOfStockProducts.length === 1
      ? `מלאי אזל — ${outOfStockProducts[0].name_he}`
      : `מלאי אזל — ${outOfStockProducts.length} מוצרים`;
  const html = renderLowStockHtml(outOfStockProducts);
  const provider = await resolveProvider();
  for (const to of recipients) {
    const sent =
      provider === "gmail"
        ? await sendViaGmail({ to, subject, html })
        : await sendViaResend({ to, subject, html });
    if (!sent) {
      console.warn(`[email] low-stock notification to ${to} skipped (provider=${provider})`);
    }
  }
}

export function renderAdminNotificationHtml(order: OrderWithItems): string {
  const isPickup = order.shippingMethod === "pickup";
  const orderUrl = `${STUDIO_URL.replace(/\/$/, "")}/admin/orders/${order.id}`;

  const rows = [
    infoRow("לקוח", escapeHtml(order.customerName)),
    infoRow(
      "אימייל",
      `<a href="mailto:${escapeHtml(order.customerEmail)}" style="color:${C.accent};text-decoration:none;">${escapeHtml(order.customerEmail)}</a>`,
    ),
    order.phone
      ? infoRow(
          "טלפון",
          `<a href="tel:${escapeHtml(order.phone)}" style="color:${C.accent};text-decoration:none;">${escapeHtml(order.phone)}</a>`,
        )
      : "",
    isPickup
      ? infoRow("משלוח", "איסוף עצמי")
      : infoRow("משלוח", escapeHtml(safeAddress(order.shippingAddress)), { top: true }),
  ].join("");

  const content = `
    <tr>
      <td class="px" style="padding:36px 40px 0;">
        <span style="display:inline-block;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:.4px;color:${C.accent};background:${C.soft};border-radius:999px;padding:6px 14px;">הזמנה חדשה</span>
        <div style="font-family:${SERIF};font-weight:500;font-size:27px;line-height:1.2;color:${C.heading};margin:16px 0 2px;">${escapeHtml(order.orderNumber)}</div>
        <div style="font-family:${SANS};font-size:19px;font-weight:700;color:${C.accent};">${formatPrice(order.total)}</div>
      </td>
    </tr>
    <tr>
      <td class="px" style="padding:22px 40px 0;">
        <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border-radius:12px;">
          <tr><td style="padding:14px 18px;">
            <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="px" style="padding:24px 40px 0;">${summaryTable(order)}</td>
    </tr>
    <tr>
      <td class="px" align="center" style="padding:30px 40px 38px;">${button(orderUrl, "פתח בלוח הניהול")}</td>
    </tr>`;

  return emailShell({
    preheader: `הזמנה חדשה ${order.orderNumber} · ${formatPrice(order.total)}`,
    content,
  });
}

export function renderConfirmationHtml(
  order: OrderWithItems,
  ctx: { pickupAddress?: string; pickupHours?: string; shippingEta?: string },
  locale = "he",
): string {
  const l = getLang(locale);
  const isPickup = order.shippingMethod === "pickup";

  const deliveryTitle = isPickup ? l.pickup : l.shippingLabel;
  const deliveryMain = isPickup
    ? escapeHtml(ctx.pickupAddress || l.pickupAddrFallback)
    : escapeHtml(safeAddress(order.shippingAddress));
  const deliverySub = isPickup
    ? escapeHtml(ctx.pickupHours || l.pickupHoursFallback)
    : l.postSub(escapeHtml(ctx.shippingEta || l.postEtaDefault));

  const deliveryBlock = `<table role="presentation" dir="${l.dir}" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border-radius:12px;">
    <tr><td style="padding:18px 20px;">
      <div style="font-family:${SERIF};font-size:16px;color:${C.heading};margin-bottom:6px;">${escapeHtml(deliveryTitle)}</div>
      <div style="font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink};">${deliveryMain}</div>
      <div style="font-family:${SANS};font-size:13px;line-height:1.5;color:${C.muted};margin-top:4px;">${deliverySub}</div>
    </td></tr>
  </table>`;

  const docBlock = order.morningDocumentUrl
    ? `<tr><td class="px" align="center" style="padding:26px 40px 0;">${button(order.morningDocumentUrl, l.receiptBtn)}</td></tr>`
    : "";

  const content = `
    <tr>
      <td class="px" style="padding:38px 40px 0;">
        <h1 class="h1" style="margin:0 0 10px;font-family:${SERIF};font-weight:500;font-size:30px;line-height:1.2;color:${C.heading};">${escapeHtml(l.greeting(order.customerName))}</h1>
        <p style="margin:0;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.muted};">${l.body(escapeHtml(order.orderNumber), C.ink)}</p>
      </td>
    </tr>
    <tr>
      <td class="px" style="padding:26px 40px 0;">${summaryTable(order, locale)}</td>
    </tr>
    <tr>
      <td class="px" style="padding:28px 40px 0;">${deliveryBlock}</td>
    </tr>
    ${docBlock}
    <tr>
      <td class="px" style="padding:30px 40px 38px;border-top:1px solid ${C.border};margin-top:8px;">
        <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.65;color:${C.muted};">${escapeHtml(l.footerNote)}</p>
      </td>
    </tr>`;

  return emailShell({ preheader: l.preheader(order.orderNumber), content, locale });
}

function renderLowStockHtml(products: { name_he: string; slug: string }[]): string {
  const site = STUDIO_URL.replace(/\/$/, "");
  const rows = products
    .map(
      (p) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:15px;color:${C.ink};">${escapeHtml(p.name_he)}</td>
        <td align="left" style="padding:10px 0;border-bottom:1px solid ${C.border};white-space:nowrap;">
          <a href="${escapeHtml(`${site}/admin/products`)}" style="font-family:${SANS};font-size:13px;color:${C.accent};text-decoration:none;">עדכן מלאי</a>
        </td>
      </tr>`,
    )
    .join("");

  const content = `
    <tr>
      <td class="px" style="padding:36px 40px 0;">
        <span style="display:inline-block;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:.4px;color:${C.accent};background:${C.soft};border-radius:999px;padding:6px 14px;">התראת מלאי</span>
        <div style="font-family:${SERIF};font-weight:500;font-size:27px;line-height:1.2;color:${C.heading};margin:16px 0 8px;">מלאי אזל</div>
        <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};">המוצרים הבאים הגיעו ל-0 יחידות במלאי לאחר ההזמנה האחרונה:</p>
      </td>
    </tr>
    <tr>
      <td class="px" style="padding:22px 40px 0;">
        <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td>
    </tr>
    <tr>
      <td class="px" align="center" style="padding:30px 40px 38px;">${button(`${site}/admin/products`, "עבור לניהול מוצרים")}</td>
    </tr>`;

  return emailShell({ preheader: "מוצר אחד או יותר אזל מהמלאי", content });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeAddress(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return [parsed.street, parsed.city, parsed.zip].filter(Boolean).join(", ");
  } catch {
    return json;
  }
}
