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
  items: (OrderItem & { product: Pick<Product, "name" | "slug"> })[];
};

type SendArgs = { to: string; subject: string; html: string };

async function sendViaResend(args: SendArgs): Promise<boolean> {
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

async function sendViaGmail(args: SendArgs): Promise<boolean> {
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
): Promise<void> {
  const args: SendArgs = {
    to: order.customerEmail,
    subject: `הזמנה ${order.orderNumber} התקבלה — אורות וכלים`,
    html: renderConfirmationHtml(order, ctx),
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

function renderAdminNotificationHtml(order: OrderWithItems): string {
  const isPickup = order.shippingMethod === "pickup";
  const items = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #eadfd2;">${escapeHtml(i.product.name)} × ${i.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eadfd2;text-align:start;white-space:nowrap;">${formatPrice(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");
  const orderUrl = `${STUDIO_URL.replace(/\/$/, "")}/admin/orders/${order.id}`;
  const phoneRow = order.phone
    ? `<tr><td style="padding:4px 8px 4px 0;color:#6b5b4a;">טלפון</td><td>${escapeHtml(order.phone)}</td></tr>`
    : "";
  const deliveryRow = isPickup
    ? `<tr><td style="padding:4px 8px 4px 0;color:#6b5b4a;">משלוח</td><td>איסוף עצמי</td></tr>`
    : `<tr><td style="padding:4px 8px 4px 0;color:#6b5b4a;vertical-align:top;">משלוח</td><td>${escapeHtml(safeAddress(order.shippingAddress))}</td></tr>`;

  return `<!doctype html>
<html lang="he" dir="rtl">
  <body style="margin:0;background:#f7f1ea;font-family:'Assistant',Arial,sans-serif;color:#2d251c;">
    <div style="max-width:560px;margin:0 auto;padding:28px 24px;">
      <h1 style="font-family:'Frank Ruhl Libre',serif;font-weight:500;font-size:24px;margin:0 0 4px;color:#3b2f24;">הזמנה חדשה</h1>
      <p style="margin:0 0 20px;color:#6b5b4a;"><strong>${escapeHtml(order.orderNumber)}</strong> · ${formatPrice(order.total)}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">
        <tbody>
          <tr><td style="padding:4px 8px 4px 0;color:#6b5b4a;">לקוח</td><td>${escapeHtml(order.customerName)}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#6b5b4a;">אימייל</td><td><a href="mailto:${escapeHtml(order.customerEmail)}" style="color:#93582d;">${escapeHtml(order.customerEmail)}</a></td></tr>
          ${phoneRow}
          ${deliveryRow}
        </tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;">
        <tbody>${items}</tbody>
        <tfoot>
          <tr><td style="padding:6px 0;color:#6b5b4a;">סכום ביניים</td><td style="padding:6px 0;text-align:start;">${formatPrice(order.subtotal)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b5b4a;">משלוח</td><td style="padding:6px 0;text-align:start;">${order.shippingCost > 0 ? formatPrice(order.shippingCost) : "חינם"}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">סך הכול</td><td style="padding:6px 0;text-align:start;font-weight:600;">${formatPrice(order.total)}</td></tr>
        </tfoot>
      </table>

      <p style="margin:24px 0 0;"><a href="${escapeHtml(orderUrl)}" style="display:inline-block;background:#3b352d;color:#f7f1e6;padding:10px 18px;border-radius:999px;text-decoration:none;font-size:14px;">פתח בלוח הניהול</a></p>
    </div>
  </body>
</html>`;
}

function renderConfirmationHtml(
  order: OrderWithItems,
  ctx: { pickupAddress?: string; pickupHours?: string; shippingEta?: string },
): string {
  const isPickup = order.shippingMethod === "pickup";
  const items = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eadfd2;">${escapeHtml(i.product.name)} × ${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eadfd2;text-align:start;white-space:nowrap;">${formatPrice(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  const deliveryBlock = isPickup
    ? `
      <h3 style="margin:24px 0 8px;font-family:'Frank Ruhl Libre',serif;color:#3b2f24;">איסוף עצמי</h3>
      <p style="margin:0 0 4px;">${escapeHtml(ctx.pickupAddress || "כתובת תיאום באמצעות וואטסאפ")}</p>
      <p style="margin:0;color:#6b5b4a;font-size:14px;">${escapeHtml(ctx.pickupHours || "ניצור איתך קשר לתיאום שעה")}</p>`
    : `
      <h3 style="margin:24px 0 8px;font-family:'Frank Ruhl Libre',serif;color:#3b2f24;">משלוח</h3>
      <p style="margin:0 0 4px;">${escapeHtml(safeAddress(order.shippingAddress))}</p>
      <p style="margin:0;color:#6b5b4a;font-size:14px;">דואר ישראל · ${escapeHtml(ctx.shippingEta || "עד 7 ימי עסקים")}</p>`;

  const docLink = order.morningDocumentUrl
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(order.morningDocumentUrl)}" style="color:#a06b3a;">הורד קבלה (PDF)</a></p>`
    : "";

  return `<!doctype html>
<html lang="he" dir="rtl">
  <body style="margin:0;background:#f7f1ea;font-family:'Assistant',Arial,sans-serif;color:#2d251c;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-family:'Frank Ruhl Libre',serif;font-weight:500;font-size:28px;margin:0 0 8px;color:#3b2f24;">תודה, ${escapeHtml(order.customerName)}</h1>
      <p style="margin:0 0 24px;color:#6b5b4a;">קיבלנו את הזמנתך <strong>${escapeHtml(order.orderNumber)}</strong>. כל פריט נוצר ביד — אתחיל להכין עכשיו.</p>

      <table style="width:100%;border-collapse:collapse;">
        <tbody>${items}</tbody>
        <tfoot>
          <tr><td style="padding:8px 0;color:#6b5b4a;">סכום ביניים</td><td style="padding:8px 0;text-align:start;">${formatPrice(order.subtotal)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b5b4a;">משלוח</td><td style="padding:8px 0;text-align:start;">${order.shippingCost > 0 ? formatPrice(order.shippingCost) : "חינם"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;">סך הכול</td><td style="padding:8px 0;text-align:start;font-weight:600;">${formatPrice(order.total)}</td></tr>
        </tfoot>
      </table>

      ${deliveryBlock}
      ${docLink}

      <p style="margin:32px 0 0;color:#6b5b4a;font-size:14px;">לכל שאלה אפשר פשוט להשיב למייל הזה.</p>
      <p style="margin:8px 0 0;color:#6b5b4a;font-size:13px;"><a href="${STUDIO_URL}" style="color:#a06b3a;">${STUDIO_URL.replace(/^https?:\/\//, "")}</a></p>
    </div>
  </body>
</html>`;
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
