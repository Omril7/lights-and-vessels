# API Routes & Morning Integration

## API Routes

All API routes under `/api/` should:
- Validate request bodies (use Zod).
- Return proper HTTP status codes.
- Admin routes check session auth.

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | * | NextAuth handlers |
| `/api/products` | GET | List products (supports `?category=`, `?featured=`, `?published=`) |
| `/api/products` | POST | Create product (admin) |
| `/api/products/[id]` | PUT | Update product (admin) |
| `/api/products/[id]` | DELETE | Delete product (admin) |
| `/api/upload` | POST | Upload images, return URLs (admin) |
| `/api/orders` | GET | List orders (admin) |
| `/api/orders/[id]` | GET | Order detail (admin) |
| `/api/orders/[id]` | PUT | Update order status (admin) |
| `/api/checkout` | POST | Create a Morning hosted payment-form request; returns the redirect URL |
| `/api/webhooks/morning` | POST | Morning IPN — verify signature, mark order paid, persist the issued document |
| `/api/orders/[id]/resend-document` | POST | Re-email the tax invoice / receipt to the customer (admin) |
| `/api/orders/[id]/refund` | POST | Issue a Morning credit note (full or partial) and update order status (admin) |
| `/api/morning/documents` | GET | List Morning documents with filters (type, date, search) (admin) |
| `/api/morning/documents/[id]` | GET | Fetch a single document + fresh signed PDF URL (admin) |
| `/api/morning/reports` | GET | Revenue / income aggregates from Morning (admin) |
| `/api/site-content` | GET | Get all content blocks |
| `/api/site-content` | PUT | Update content block (admin) |

---

## Morning (Green Invoice) Integration

API docs: <https://www.greeninvoice.co.il/api-docs/>. All requests are REST + JSON against `https://api.greeninvoice.co.il/api/v1/`. Auth is JWT — exchange `MORNING_API_KEY_ID` + `MORNING_API_SECRET` for a short-lived token via `POST /account/token`, cache it server-side (in memory) and refresh on 401.

**Why Morning, not Stripe.** The client already has a Morning account for issuing receipts. Using Morning for payment too means one source of truth: every paid order automatically produces a legal Israeli tax document (חשבונית מס/קבלה or קבלה — TBD with client), refunds become credit notes (חשבונית זיכוי), and revenue reports come straight from Morning's reporting endpoints. The artist never logs into greeninvoice.co.il — this app is the full surface.

**Document type — decided.** The artist is **עוסק פטור**, so the auto-issued document on payment success is **`400` — קבלה only** (no VAT line, no חשבונית מס). Line items on the payment-form request use **`income[].vatType: 2`** (Exempt / VAT free) per Morning's API enum (`0` = default by business type, `1` = VAT included in the price, `2` = exempt). Configurable via `MORNING_DEFAULT_DOC_TYPE` for the (unlikely) future move to עוסק מורשה — at which point `vatType` flips to `0`.

**Checkout flow (Hosted Payment Form)**
1. Customer clicks "תשלום" on the cart page → `POST /api/checkout` with cart items + customer email/name/phone/shipping address.
2. Server creates a draft `Order` (status `pending`) in our DB so we have a stable id.
3. Server calls Morning **`POST /payments/form`** with:
   - `description` — e.g. `הזמנה ORD-1042`
   - `type` — the default doc type (320 by default — see open question above)
   - `lang: "he"`, `currency: "ILS"`
   - `income` — line items (name, quantity, unitPrice, vatType)
   - `client` — name, emails, address, taxId (optional)
   - `successUrl` — `/checkout/success?orderId=…` on our site
   - `failureUrl` — `/checkout/failed?orderId=…`
   - `notifyUrl` — `/api/webhooks/morning` (server-to-server IPN)
   - `pluginId` — our `MORNING_PLUGIN_ID` if Morning requires one for the merchant
4. Morning returns a hosted form URL. We persist `morningPaymentFormId` + `morningPaymentFormUrl` on the order and respond to the client with the URL; the browser redirects.
5. Customer completes payment on Morning's hosted page (credit card, Bit, Google Pay — whatever the client has enabled in his Morning account).
6. Morning IPNs `/api/webhooks/morning` with the result. The handler:
   - Verifies the request authenticity (signature header per Morning's docs; reject otherwise).
   - On success: marks the order `confirmed`, sets `paidAt`, `morningTransactionId`, `morningDocumentId`, `morningDocumentNumber`, `morningDocumentUrl`. Inserts a `MorningDocument` row.
   - On failure / cancel: leaves the order in `pending` status so the customer can retry from `/checkout/failed`. The failed page offers a "נסה שוב" button that re-issues a new Morning payment-form request against the same draft order (updates `morningPaymentFormId` / `morningPaymentFormUrl`).
   - Sends the confirmation email to the customer (subject in Hebrew, body in Hebrew, attaches the document PDF or links to it).
7. The success/failure pages on the storefront look up the order by id and show a friendly Hebrew confirmation screen with the order number and a link to download the PDF.

**Idempotency.** The IPN may fire more than once. Key all writes on `morningPaymentFormId` so duplicate notifications are no-ops.

**Refunds (credit notes).** From the order detail page in admin, an "החזר כספי" action issues a **חשבונית זיכוי (doc type 330)** via Morning's documents API, links it to the original document, supports full or partial amount, and stores the result as a new `MorningDocument` row tied to the same order. The order status moves to `refunded` (full) or stays `confirmed` with a refund flag (partial — pick a convention before coding).

**Documents archive (admin).** `/admin/documents` proxies Morning's documents listing with filters: type (all / invoice / receipt / credit note), date range, free-text search, customer name. Each row: number, type, date, amount, customer, linked order (if any), "הורד PDF", "שלח במייל מחדש". PDF URLs are short-lived — always fetch a fresh one when the user clicks download.

**Reports (admin).** `/admin/reports` calls Morning's reporting endpoints to show:
- Income by month (bar chart) — last 12 months, ILS.
- Income by document type (pie/breakdown).
- Top customers (table).
- All filterable by date range.
Charts use a small dep (e.g. `recharts`) — confirm before adding.

**Expenses, clients list.** Out of scope for Phase 3. Possibly Phase 6.

**Email confirmation.** Morning emails the receipt PDF directly to the customer (`sendByEmail: true` on document creation). **In addition**, this app sends its own branded order-confirmation email — the artist confirmed he wants both. The branded email is in Hebrew, uses the studio's name and palette, links to the order/PDF, and is sent from a sender configured per provider. **The branded email is sent for both shipping methods** — for `shippingMethod: "post"` it shows the shipping address + ETA; for `"pickup"` it shows the pickup address + hours from `SiteContent` (`shipping_pickup_address`, `shipping_pickup_hours`) instead.

**Provider switch (admin toggle).** The choice between providers lives in `SiteContent.email_use_gmail` (`"true"` = Gmail, anything else = Resend). The artist flips it from `/admin/site-content` under "התראות אימייל" — no redeploy. `EMAIL_PROVIDER` env var still exists as a fallback if the DB is unreachable. Credentials for both providers continue to live in env vars (DB never stores secrets).

The send function in `src/lib/email.ts` reads the toggle and picks one of two backends per send:

| Provider | When to use | Tradeoffs |
|---|---|---|
| `resend` (default) | Anytime the artist has (or will have) a custom domain. | Free 3000/mo. Proper DKIM/SPF once the domain is verified in Resend. Professional `From: hello@<artist-domain>`. While on `onboarding@resend.dev` (no domain yet): works, but limited to 100/day and the artist's own inbox. |
| `gmail` | No-domain fallback / quick MVP. Uses nodemailer + Gmail SMTP via an App Password. | Free. ~500 sends/day (personal Gmail) or 2000/day (Workspace). `From: <artist-gmail>@gmail.com` looks personal/amateur and triggers spam filters more often (especially Outlook). Requires 2FA + an App Password from <https://myaccount.google.com/apppasswords>. Set `GMAIL_USER` + `GMAIL_APP_PASSWORD` in `.env`. |

When the chosen provider's credentials are missing, the send is skipped with a `console.warn` (it never throws and never blocks order creation). Decision is reversible by flipping `EMAIL_PROVIDER` — no code change.

**Environment & credentials.** See [ENV.md](ENV.md). Test against Morning's **sandbox** (`https://sandbox.d.greeninvoice.co.il/api/v1/`) until the client confirms go-live.
