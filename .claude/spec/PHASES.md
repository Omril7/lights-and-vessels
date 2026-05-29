# Implementation Phases

For what has been *built* so far, see [PROGRESS_LOG.md](PROGRESS_LOG.md). This file is the plan.

## Phase 1 — Foundation & Storefront
1. Initialize Next.js 14 project with TypeScript + Tailwind.
2. Set up Prisma schema + SQLite. Run migrations.
3. Seed database with sample products (at least 8 items across categories) and default site content.
4. Build the Tailwind theme (colors, fonts, spacing).
5. Build storefront layout (Navbar + Footer).
6. Build Home page with all sections.
7. Build Shop page with grid + filters.
8. Build Product Detail page with image gallery.
9. Build About page.
10. Implement cart (zustand store + CartDrawer + Cart page).

## Phase 2 — Admin Panel
1. Set up NextAuth.js with credentials provider.
2. Build admin layout with sidebar.
3. Build Dashboard with stats.
4. Build Products list + CRUD pages with image upload.
5. Build Site Content editor.
6. Build Orders list + detail views.

## Phase 3 — Payments, Documents & Reports (Morning / Green Invoice)

**Pre-work (touches Phase 1 & 2 — small migration):**
1. Prisma migration: drop `Order.stripeSessionId` / `Order.stripePaymentId` (the real schema still has them); add all Morning fields listed in [SCHEMA.md](SCHEMA.md); add the `MorningDocument` model; add `Order.shippingMethod` (`"post"` | `"pickup"`); make `Product.category` nullable. Update seed if it references old fields.
2. ~~Confirm with client: doc type, VAT, branded email~~ — **answered in 2026-05-24 meeting**: עוסק פטור → doc `400`; branded Resend email = yes.

**Build:**
3. Build `lib/morning.ts` — JWT auth (token cache + refresh on 401), typed wrappers for: `POST /payments/form`, `POST /documents` (credit notes), `GET /documents` (list + by id), `GET /documents/[id]/preview` (PDF URL refresh), reporting endpoints. All requests log a sanitized audit trail.
4. `/api/checkout` — validate cart, create draft order, call Morning payment form, return redirect URL.
5. `/checkout/success` and `/checkout/failed` storefront pages — friendly Hebrew confirmation / retry screens.
6. `/api/webhooks/morning` — signature verification, idempotent order finalization, persist `MorningDocument`.
7. Order detail (admin) extensions:
   - Payment block: amount paid, paid-at, document number + "הורד PDF" + "שלח במייל מחדש".
   - "החזר כספי" action — full/partial credit note via `/api/orders/[id]/refund`.
   - Status flow updated to include `refunded` (and `partially_refunded` if we adopt that — decide during build).
8. `/admin/documents` — documents archive page with filters, PDF download, resend-by-email.
9. `/admin/reports` — revenue charts from Morning's reporting endpoints.
10. Dashboard tweaks: revenue card pulls from Morning reports (not just summed DB orders) so it matches the artist's books.
11. **Required:** Branded order-confirmation email via Resend (Hebrew, RTL, studio palette + logo, links to order + PDF), in addition to Morning's document email. Triggered from the IPN handler after the order is finalized.
12. ~~**Required:** Admin "new order" notification email to every address in `ADMIN_EMAILS`, sent right after the customer confirmation in the same IPN handler.~~ ✅ Implemented. See [API.md](API.md) → *Admin notification*.

**Out of scope for Phase 3** (candidates for a future phase): expenses, Morning clients list, manual expense entry.

## Phase 4 — Polish
1. Loading states and skeletons.
2. Error boundaries and toast notifications.
3. SEO: meta tags, Open Graph, structured data for products.
4. Image optimization (next/image, WebP).
5. Accessibility pass (keyboard nav, ARIA labels, color contrast).
6. Performance audit (Lighthouse).
7. Favicon / site icon + branding assets (favicon, apple-touch-icon, app icons; replace the default Next.js favicon).

## Phase 5 — Pre-deploy checklist

Moved to its own file: see [PRE_DEPLOY.md](PRE_DEPLOY.md) for account ownership & handoff plan, prod env vars, OAuth + Morning setup, image-uploads/database/hardening checklists.
