/**
 * Test the email senders WITHOUT creating an order or payment.
 *
 * Usage (from project root):
 *
 *   # 1. Preview only — render both emails to HTML files you can open in a browser.
 *   npx tsx scripts/test-email.ts
 *
 *   # 2. Actually send (verify Gmail / Resend really delivers).
 *   npx tsx scripts/test-email.ts --send --provider gmail  --to omrileizerovitch7@gmail.com
 *   npx tsx scripts/test-email.ts --send --provider resend --to multisellerprowampi@gmail.com
 *
 * Flags:
 *   --send                           Actually send the email (otherwise just writes HTML files).
 *   --provider gmail|resend          Which sender to use (default: resend).
 *   --to <email>                     Recipient for --send (default: GMAIL_USER or first ADMIN_EMAILS).
 *   --kind confirmation|admin|both   Which template to use (default: both).
 */
import { loadEnvConfig } from "@next/env";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Load .env / .env.local the same way Next.js does, before importing app code.
loadEnvConfig(process.cwd());

import {
  renderConfirmationHtml,
  renderAdminNotificationHtml,
  sendViaGmail,
  sendViaResend,
} from "@/lib/email";

// --- tiny arg parser -------------------------------------------------------
const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const val = (f: string) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : undefined;
};

const doSend = has("--send");
const provider = (val("--provider") || "resend").toLowerCase() as "gmail" | "resend";
const kind = (val("--kind") || "both").toLowerCase();
const method = (val("--method") || "post").toLowerCase(); // "post" or "pickup"
const to = val("--to") || process.env.GMAIL_USER || "test@example.com";

// --- fake order (matches the shape the renderers expect) -------------------
const order = {
  id: "test-order-id",
  orderNumber: "TEST-1001",
  status: "paid",
  customerName: "ישראל ישראלי",
  customerEmail: to,
  phone: "0501234567",
  shippingMethod: method, // "post" or "pickup", via --method
  shippingAddress: JSON.stringify({ street: "רחוב הברוש 12", city: "תל אביב", zip: "6100000" }),
  subtotal: 380,
  shippingCost: 30,
  total: 410,
  morningDocumentUrl: "https://example.com/receipt.pdf",
  items: [
    { id: "i1", quantity: 1, price: 220, productId: "p1", orderId: "test-order-id", product: { name: "מנורת חרס", slug: "clay-lamp" } },
    { id: "i2", quantity: 2, price: 80, productId: "p2", orderId: "test-order-id", product: { name: "כלי קטן", slug: "small-vessel" } },
  ],
  // fields not used by the renderers but present on the model:
  createdAt: new Date(),
  updatedAt: new Date(),
  paidAt: new Date(),
  notes: null,
  morningPaymentFormId: null,
  morningPaymentFormUrl: null,
  morningTransactionId: null,
  morningDocumentId: null,
  morningDocumentNumber: null,
} as unknown as Parameters<typeof renderConfirmationHtml>[0];

const confirmationHtml = renderConfirmationHtml(order, {
  shippingEta: "עד 7 ימי עסקים",
  pickupAddress: "סטודיו, רחוב האמן 3, תל אביב",
  pickupHours: "א׳–ה׳ 10:00–16:00",
});
const adminHtml = renderAdminNotificationHtml(order);

// --- preview: always write the HTML to disk so you can inspect it ----------
const outDir = join(process.cwd(), "tmp");
mkdirSync(outDir, { recursive: true });
const confPath = join(outDir, "email-confirmation.html");
const adminPath = join(outDir, "email-admin.html");
writeFileSync(confPath, confirmationHtml, "utf8");
writeFileSync(adminPath, adminHtml, "utf8");
console.log("Rendered HTML written to:");
console.log("  customer confirmation:", confPath);
console.log("  admin notification:   ", adminPath);
console.log("Open them in a browser to inspect the layout.\n");

// --- optional: actually send ----------------------------------------------
async function main() {
  if (!doSend) {
    console.log("Preview only. Add --send to actually deliver an email.");
    console.log(`Example: npx tsx scripts/test-email.ts --send --provider gmail --to ${to}`);
    return;
  }

  const send = provider === "gmail" ? sendViaGmail : sendViaResend;
  const targets: Array<{ subject: string; html: string }> = [];
  if (kind === "confirmation" || kind === "both") {
    targets.push({ subject: `הזמנה ${order.orderNumber} התקבלה — אורות וכלים`, html: confirmationHtml });
  }
  if (kind === "admin" || kind === "both") {
    targets.push({ subject: `הזמנה חדשה ${order.orderNumber} — בדיקה`, html: adminHtml });
  }

  console.log(`Sending via ${provider} to ${to} ...`);
  for (const t of targets) {
    const ok = await send({ to, subject: t.subject, html: t.html });
    console.log(`  ${ok ? "✓ sent" : "✗ failed/skipped"}: ${t.subject}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
