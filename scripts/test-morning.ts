/**
 * Test the Morning (Green Invoice) payment-form creation WITHOUT a real order.
 * Prints the hosted payment-page URL, or the exact error Morning returns.
 *
 * Usage (from project root):
 *   npx tsx scripts/test-morning.ts
 */
import { loadEnvConfig } from "@next/env";

// Load .env / .env.local the same way Next.js does, before importing app code.
loadEnvConfig(process.cwd());

async function main() {
  // Dynamic import AFTER env is loaded — morning.ts captures the keys into
  // module-level constants at import time, so a static import (hoisted above
  // loadEnvConfig) would read them as empty.
  const { createPaymentForm, VAT_TYPE_EXEMPT } = await import("@/lib/morning");

  console.log("Morning config:");
  console.log("  BASE      :", process.env.MORNING_API_BASE || "(default sandbox)");
  console.log("  KEY_ID    :", process.env.MORNING_API_KEY_ID ? "set" : "MISSING");
  console.log("  SECRET    :", process.env.MORNING_API_SECRET ? "set" : "MISSING");
  console.log("  PLUGIN_ID :", process.env.MORNING_PLUGIN_ID || "(empty)");
  console.log("  DOC_TYPE  :", process.env.MORNING_DEFAULT_DOC_TYPE || "400");
  console.log("");

  // Morning's WAF rejects http://localhost callback URLs with a 403, so for a
  // standalone test we use a public https placeholder. The real app uses
  // NEXTAUTH_URL, which must be a public https origin (tunnel / Vercel) in prod.
  const origin = "https://example.com";

  const form = await createPaymentForm({
    description: "בדיקה — הזמנה TEST-1001",
    income: [
      { description: "מנורת חרס", quantity: 1, price: 220, vatType: VAT_TYPE_EXEMPT, itemId: "p1" },
    ],
    client: {
      name: "ישראל ישראלי",
      emails: ["test@example.com"],
      phone: "0501234567",
      country: "IL",
    },
    successUrl: `${origin}/checkout/success?orderId=test`,
    failureUrl: `${origin}/checkout/failed?orderId=test`,
    notifyUrl: `${origin}/api/webhooks/morning`,
    custom: "test",
  });

  console.log("Result:", JSON.stringify(form, null, 2));
  if (form.url) {
    console.log("\n✓ Open this URL in a browser to see the payment page:\n");
    console.log("  " + form.url + "\n");
  } else {
    console.log("\n✗ No URL returned. See errorCode/errorMessage above.\n");
  }
}

main().catch((err) => {
  console.error("\n✗ createPaymentForm threw:\n");
  console.error(err);
  process.exit(1);
});
