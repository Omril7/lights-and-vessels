# Progress Log

A running record of what has been built, phase by phase. Update this as work proceeds.

## Phase 1 — Foundation & Storefront — ✅ Complete

**Setup & data**
- Next.js 14 (App Router) + TypeScript + Tailwind; all config files.
- Prisma + SQLite schema, migrated. Seed: 10 Hebrew products across 5 categories (1 deliberately out of stock) + 14 `SiteContent` blocks + admin user.
- Earthy Tailwind theme (clay/sand/terracotta/olive/charcoal + gold/copper), CSS-variable colors, paper-grain & watercolor textures.

**Localization (Hebrew / RTL)**
- `<html lang="he" dir="rtl">`; Hebrew fonts (Frank Ruhl Libre headings + Assistant body).
- All UI text in Hebrew; prices in ₪ (`he-IL`); logical properties so layout mirrors; cart drawer slides from the left.

**Storefront**
- Layout: sticky Navbar (scroll-aware, mobile menu, cart badge) + Footer.
- Home: hero, featured products, artist-story teaser, category strip, testimonials.
- Shop: category pill filters + sort, "load more" pagination, empty state.
- Product detail: image gallery (lightbox + zoom + swipe), markdown description, quantity selector, related products, breadcrumb.
- About: rich-text bio, portrait, process gallery, contact section.
- Cart: full cart page + slide-out CartDrawer (zustand + localStorage), subtotal/shipping/total.
- UI primitives (Button, Input, Badge, Modal, Dropdown), Motion (`motion/react`) fade-ins, 404 page.

**Cross-cutting features added during Phase 1**
- Responsive design pass — verified 320px → 1440px+, mobile-first.
- Accessibility widget — floating button + panel (font size, contrast, grayscale, highlight links, readable font, large cursor, reduce motion), persisted, on every page.
- Floating WhatsApp button + "צרו קשר" contact section, details from `SiteContent`.

**Post-Phase-1 refinements**
- Replaced the native sort `<select>` with a custom themed `Dropdown` component.
- Improved product-detail thumbnail active state (visible copper ring + scale, no longer relies on an invisible ring-offset).
- Sale/sold-out badges made more prominent — gentle pulse animation on "במבצע", solid sold-out badge, dimmed image overlay for sold-out cards.

**Phase 1 follow-up — migrate animations to Motion (`motion/react`) — ✅ Complete**
- `package.json` depends on `motion` (^11.18.2); `framer-motion` is no longer a direct dependency (only a transitive of `motion` itself).
- All 9 animation source files import from `motion/react` (Modal, Dropdown, FadeIn, AccessibilityWidget, CartDrawer, NavbarBanner, ProductCard, ProductGallery, motion-prefs).
- "במבצע" pulse ported to `motion.div` keyframes (scale + boxShadow) — no CSS keyframe.
- The only remaining CSS animation (`animate-ping` on the WhatsApp button) is gated by both `html.a11y-no-motion` and `@media (prefers-reduced-motion: reduce)` in `globals.css`.
- `MotionPrefsProvider` combines `useReducedMotion` (OS) with the widget's `a11y-no-motion` class and feeds `MotionConfig reducedMotion`, so all `motion/react` animations collapse under either signal.

## Phase 2 — Admin Panel — ✅ Complete

**Auth**
- NextAuth (Google OAuth, JWT session) in `lib/auth.ts`; `/api/auth/[...nextauth]`; access gated by `ADMIN_EMAILS` allowlist (no `User` table).
- `middleware.ts` protects `/admin/*` except `/admin/login`; admin layout doubly checks server-side session.
- Hebrew/RTL login page at `/admin/login`.
- Session role typing via `src/types/next-auth.d.ts`; `requireAdmin()` helper in `lib/admin.ts` for API gating.

**Layout**
- Earthy admin shell — fixed sidebar (desktop) + mobile top bar + bottom-nav tab bar; sign-out and "back to site" actions; navigation icons via Heroicons.

**Dashboard** (`/admin`)
- 4 stat cards (products, orders, pending, month revenue) + last-10 orders table with status badges.

**Products**
- List (`/admin/products`) — thumbnail, name+slug, category, price, stock, published/featured badges.
- Create + edit pages share `<ProductForm>` — name/slug (auto-slug, editable), price, compare-at, category, tags, stock, publish/featured toggles.
- Description: textarea + Markdown live-preview tab (no extra deps, reuses `renderMarkdown`).
- `<ImageUploader>` — react-dropzone multi-upload, HTML5 drag-reorder, alt text per image, delete; uploads via `/api/upload`.
- Delete flow with confirm.

**Image storage**
- Supabase Storage `site-images` bucket (public). `/api/upload` writes via service-role key to `<folder>/<year>/<uuid>.<ext>` where `folder` is either `products` (gallery) or `content` (hero/story/about), returns the public CDN URL stored in `ProductImage.url` or `SiteContent.value`. `next.config.js` whitelists the bucket host for `next/image`.

**Site content** (`/admin/site-content`)
- Grouped editor — Banner (toggle switch + text + URL), Hero, Story, About (Markdown), Process gallery, Category images, Testimonials, Contact, Footer, Email provider (toggle).
- Image fields upload to Supabase Storage (`folder=content`) and persist the public URL into the `SiteContent` row.
- Composite fields stored as JSON strings inside `SiteContent.value`:
  - `process_gallery` — `[{url, alt}]` (homepage hidden if empty; admin: add / reorder / alt-text / delete).
  - `category_images` — `{<slug>: <url>}` (CategoryStrip filters to slugs with images; admin renders one slot per `CATEGORIES` entry, so new categories auto-appear).
  - `testimonials` — `[{quote, name, detail, image}]` (Testimonials section hidden if empty; admin: add / edit / reorder / delete; avatar falls back to name initials).
- Single "save all" — `/api/site-content` PUT upserts every key in a transaction.

**Orders**
- List (`/admin/orders`) with status pill filters.
- Detail (`/admin/orders/[id]`) — items table with totals, customer + parsed shipping address, status dropdown + admin notes (PUT `/api/orders/[id]`).
- Shared `lib/orders.ts` for statuses/labels/tones.

**APIs added**
- `/api/products` (GET, POST), `/api/products/[id]` (PUT, DELETE) — Zod validated, admin gated, slug uniqueness checked, images replaced atomically on edit.
- `/api/orders` (GET), `/api/orders/[id]` (GET, PUT).
- `/api/site-content` (GET, PUT).
- `/api/upload` (POST, multipart, 8MB cap, mime allowlist) — pushes to Supabase Storage `products` bucket.


## Phase 3 — Payments, Documents & Reports — ✅ Code complete (pending live sandbox test)

**Pre-work**
- Prisma migration: dropped `Order.stripeSessionId` / `stripePaymentId`; added Morning fields on `Order` (`morningPaymentFormId`/`Url`, `morningTransactionId`, `morningDocumentId`/`Number`/`Url`, `paidAt`); added `Order.shippingMethod` (`"post"`|`"pickup"`); added `MorningDocument` model; made `Product.category` nullable. DB synced via `prisma db push`.
- Env: removed `STRIPE_*`; added Morning vars (`MORNING_DEFAULT_DOC_TYPE=400`) + Resend block (`RESEND_FROM_EMAIL=onboarding@resend.dev` for dev). Dep swap: removed `stripe`, added `resend` and `recharts`.
- Added shipping `SiteContent` keys + fallbacks (`shipping_post_price`, `shipping_post_eta`, `shipping_free_over`, `shipping_pickup_address`, `shipping_pickup_hours`, `shipping_processing_days`).
- Storefront: category filter on `/shop` and category strip on Home are hidden until at least one product has a non-null category.

**Morning API client — `src/lib/morning.ts`**
- JWT auth: `POST /account/token` with key id + secret, in-memory cache, 401-triggered refresh.
- Typed wrappers: `createPaymentForm`, `getDocument`, `getDocumentPreviewUrl`, `createCreditNote`, `listDocuments`, `resendDocumentByEmail`, `getIncomeReport`.
- Constants: `VAT_TYPE_EXEMPT = 2` (income line items, עוסק פטור); `DOC_TYPE` map (`TAX_INVOICE_RECEIPT=320`, `RECEIPT=400`, `CREDIT_NOTE=330`).
- `verifyWebhookSignature(rawBody, header)` — HMAC-SHA256 against `MORNING_WEBHOOK_SECRET`, constant-time compare.

**Checkout flow**
- New `/checkout` page (server) + `<CheckoutForm>` (client): contact details, shipping-method radio (post / pickup), conditional address fields, live shipping cost from `SiteContent` (with free-over threshold), live total.
- `POST /api/checkout` — Zod-validated, server-side stock + price re-check, draft `Order` in `pending`, calls `createPaymentForm` (`vatType: 2`, `type: 400`, `successUrl` / `failureUrl` / `notifyUrl` / `custom: order.id`), persists `morningPaymentFormId`/`Url`, returns `redirectUrl`.
- `/checkout/success` — server fetches order, shows summary + pickup/shipping info + PDF link, clears cart on mount.
- `/checkout/failed` — `<RetryPaymentButton>` calls `POST /api/checkout/retry` which re-issues the form against the same `pending` order (decision: failed payments stay `pending` so the customer can retry; not auto-cancelled).
- Cart-page "מעבר לתשלום" now routes to `/checkout`.

**Morning webhook — `/api/webhooks/morning`**
- Signature verification enforced when `MORNING_WEBHOOK_SECRET` is set (otherwise warn-only for dev).
- Defensive payload parsing (accepts `id`/`formId`/`paymentFormId`, `documentId`/`document.id`, multiple `status` shapes — exact shape needs first live IPN to confirm).
- Resolves order by echoed `custom` (our `Order.id`) first, falls back to `morningPaymentFormId`.
- Idempotent: no-op if order is already `confirmed` + `paidAt`.
- On success: marks `confirmed`, sets `paidAt` / transaction id / document fields, upserts `MorningDocument`, fires branded Resend email (Hebrew RTL — post variant shows address + ETA; pickup variant shows address + hours from `SiteContent`).
- On failure: leaves order `pending`.

**Admin — order detail extensions**
- `<PaymentBlock>` shows amount paid, paid-at, doc number, "הורד PDF", "שלח במייל מחדש", and "החזר כספי" panel with full/partial inputs and confirm dialogs.
- New `refunded` order status (Hebrew label "הוחזרה").
- `POST /api/orders/[id]/refund` — full or partial credit note via `createCreditNote`, persists a `MorningDocument` row (negative amount), updates order to `refunded` on full.
- `POST /api/orders/[id]/resend-document` — admin re-sends the receipt PDF via Morning's distribute endpoint.
- Order detail now displays `shippingMethod` and parses both new `{street,city,zip}` and legacy `{line1,…}` address shapes.

**Admin — documents archive & reports**
- `/admin/documents` + `<DocumentsArchive>` — proxies `GET /api/morning/documents` with type / date / search filters; "הורד PDF" fetches a fresh signed URL via `GET /api/morning/documents/[id]`.
- `/admin/reports` + `<ReportsView>` — date range filter, "סך הכנסות בטווח" card, monthly revenue bar chart (recharts) from `GET /api/morning/reports`.
- Sidebar gained "מסמכים" and "דוחות" entries; mobile bottom nav widened to 6 columns.

**Dashboard**
- Month-revenue card pulls from Morning's income report when available, falls back to DB sum on error / missing creds. Label flips to "הכנסות החודש (מורנינג)" when the authoritative source is in use.

**Verification**
- `npx tsc --noEmit` passes.
- End-to-end happy path not yet tested live — requires sandbox keys + Vercel deploy (see below).

### Still needed before live testing

External setup that must be in place before a real end-to-end smoke test:

1. **`MORNING_API_KEY_ID` + `MORNING_API_SECRET`** — generated from the artist's Morning **sandbox** account at <https://app.greeninvoice.co.il/settings/developers/api>, dropped into `.env`.
2. **`MORNING_WEBHOOK_SECRET`** — generated on Morning's developers page (<https://app.greeninvoice.co.il/settings/developers/api>) against the Vercel deploy URL as the hosting/notify URL. Set it as a Vercel env var (and locally in `.env` if you want to test against the same secret). (When unset or `"..."`, the webhook route skips signature verification with a console warning — fine for very first ping, not for any real test.)
3. ~~**`RESEND_API_KEY`** — free Resend account; with `RESEND_FROM_EMAIL=onboarding@resend.dev` no domain verification is needed yet. Without the key the branded confirmation silently no-ops (logs a warn).~~
4. **Vercel deploy** → Morning's IPN must reach a public HTTPS URL. Steps:
   - Deploy the project to Vercel; note the assigned `*.vercel.app` URL (a custom domain is not required — the default Vercel domain works).
   - In Morning sandbox merchant settings, register `<vercel-url>/api/webhooks/morning` as the notify URL.
   - Set `NEXTAUTH_URL=<vercel-url>` in Vercel env vars so the `successUrl` / `failureUrl` we send Morning also point at the deploy.
   - Re-deploy after env var changes so they take effect.
5. **First live IPN payload-shape check** — the webhook handler reads `id`/`formId`/`paymentFormId`, `documentId`/`document.id`, multiple `status` shapes, and either `x-morning-signature` or `x-signature` headers. Morning's actual field names and signature header may differ; log the raw body on first ping and tighten the parser accordingly.
6. **`vatType: 2` confirmation** — the value used for עוסק פטור line items is the documented "Exempt (VAT free)" enum on `income[].vatType`. Verify Morning accepts it on the first sandbox transaction.

## Phase 4 — Polish — ✅

**SEO** ✅
- Root metadata in `src/app/layout.tsx` — title template, description, keywords, `metadataBase`, OG (he_IL + black logo), Twitter card, icons (favicon + apple-touch from `/public/logo-2169x1282-black.png`), robots directives.
- `/shop/[slug]` — `generateMetadata` adds canonical, per-product OG image (first product image), Twitter card.
- JSON-LD — `Organization` on homepage, `Product` (price/availability/SKU) on product pages.
- `src/app/robots.ts` — allows storefront, disallows `/admin`, `/api`, `/cart`, `/checkout`.
- `src/app/sitemap.ts` — static routes (`/`, `/shop`, `/about`, `/accessibility-statement`) + every published product (by `updatedAt`).
- Site URL driven by `NEXT_PUBLIC_SITE_URL` (falls back to the prod Vercel domain).

**Loading states** ✅
- `Skeleton` component (`src/components/ui/Skeleton.tsx`) — sand background + cream shimmer (`shimmer` keyframe in `tailwind.config.ts`).
- `loading.tsx` for storefront root, `/shop`, `/shop/[slug]`, and admin (`/admin`, `/admin/products`, `/admin/orders`) — skeletons mirror each page's real layout.
- Storefront layout refactored to be synchronous; `getSiteContent()` moved into Suspense-wrapped slot components (`BannerSlot`, `FooterSlot`, `WhatsAppSlot`) so the shell renders instantly and child `loading.tsx` appears during navigation.

**Error boundaries** ✅
- `(storefront)/error.tsx` — Hebrew "משהו השתבש" with reset + back-to-home buttons.
- `admin/error.tsx` — admin-flavored card showing raw `error.message` for diagnostics.
- `global-error.tsx` — last-resort boundary with inline styles (replaces `<html>`).
- All log to console via `useEffect`. Toasts (`react-hot-toast`) already wired in root layout and used across all mutating actions.

**Image optimization** ✅
- Audit confirmed: zero raw `<img>` tags — everything uses `next/image`.
- `priority` on above-the-fold images: `HeroBanner` (homepage hero), `ProductGallery` main image (product page), `About` portrait, `ShopGrid` first 4 cards. Added: `FeaturedProducts` now passes `priority={i < 4}` to the first row.
- `sizes` configured on all responsive images (cards: `(max-width: 768px) 50vw, 25vw`; hero: `100vw`; thumbs: fixed px). Quality stays at the Next.js default 75.
- Supabase Storage bucket host whitelisted in `next.config.js` so uploaded images get the Next image optimizer (AVIF/WebP variants, srcset).

**Accessibility pass** ✅
- Default `:focus-visible` ring globally (copper, 2px outline + offset) in `globals.css`. Keyboard users see focus without enabling the a11y widget.
- Skip-to-content link in storefront layout — hidden until focused, jumps to `<main id="main-content" tabIndex={-1}>`.
- `aria-current="page"` on active links in `Navbar`, admin `Sidebar` (desktop + mobile bottom-nav).
- Audit confirmed: no raw `<img>` tags (covered in image opt); icon-only buttons (cart open/close, qty +/-, drawer close, hamburger, trash) already have `aria-label`s; admin sidebar Icons marked `aria-hidden`.
- Phase 1 a11y widget (font scaling, contrast, motion, etc.) remains untouched.

**Known contrast tradeoffs (design call — not changed):** `text-charcoal/40` and `/50` opacities used for placeholders, breadcrumbs, and meta text fail WCAG AA 4.5:1 against cream. Users who need stronger contrast can flip the widget's contrast/dark modes; baseline visual hierarchy preserved otherwise.

**Apple touch icon + PWA manifest** ✅
- `src/app/manifest.ts` (served at `/manifest.webmanifest`) — **admin-only PWA**: name "ניהול אורות וכלים", `start_url: /admin`, `scope: /admin`, `display: standalone`, Hebrew RTL. Manifest is linked **only** from admin pages (via `metadata.manifest` in `src/app/admin/layout.tsx`); the storefront does not advertise an installable app.
- Apple-icon declares `sizes: "180x180"` in root `layout.tsx`.
- `/manifest.webmanifest` is publicly fetchable (gating removed — the auth redirect was logging a console error on every storefront page and dragging Best-Practices in Lighthouse). Manifest is still only *linked* from `/admin` pages.
- **Asset caveat**: both favicon and apple-touch reuse the wide `logo-2169x1282-black.png`. On iOS home screen and Android install banner this gets letterboxed (the logo is 1.7:1, not square). For a polished install experience, drop a square 180×180 (or 512×512 maskable) PNG at `public/apple-icon.png` and point the metadata + manifest at it — non-blocking but a nice-to-have.

**Lighthouse audit** ✅ (2026-05-29)
Ran across `/`, `/shop`, `/shop/[slug]`, `/blog`. Median scores after fixes: **Accessibility 100, Best-Practices 100, SEO 100** on all four pages; Performance 78–87.
- Best-Practices: removed `/manifest.webmanifest` from the NextAuth middleware matcher (was 307→signin, producing console errors on every page).
- SEO: added per-page `alternates.canonical` on `/shop` and `/blog` (root layout's `canonical: "/"` is not inherited).
- Accessibility on `/shop`: darkened `--copper` (`#a86b3c`→`#93582d`) and `--terracotta` (`#b5704e`→`#9c5a36`) to clear AA 4.5:1 on cream; `ProductCard` title now `<h2>` (was `<h3>`, skipped a level under the page `<h1>`); `Dropdown` `aria-label` now includes the visible selected option so it satisfies "Label in Name".
- Performance: wrapped `getProduct` / `getPost` in React `cache()` to dedupe the double fetch between `generateMetadata` and the page render — product TTFB **2050 ms → 740 ms**. Product gallery `AnimatePresence` set to `initial={false}` so the hero `next/image` doesn't fade in from `opacity: 0` (the LCP element). Modern `browserslist` added to `package.json` to trim polyfills.
- Deferred (low impact, higher effort): bf-cache disabled by NextAuth `Cache-Control: no-store`; render-blocking CSS (~610ms) from Next.js inlined globals.

