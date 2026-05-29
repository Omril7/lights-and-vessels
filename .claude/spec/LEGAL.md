# Legal Documents — Must-Have Before Launch

Israel-specific legal pages that the storefront **must** display before going live to real customers. Source for this list: client meeting checklist section 6 (`meeting-checklist.html`).

All five are linked from the footer. None should ship with lorem-ipsum — every word must be approved by the artist (and ideally a lawyer for terms + privacy).

---

## Status at a glance

| Doc | Hebrew | Legal basis | Status | Route |
|---|---|---|---|---|
| Terms of Service | תקנון האתר | חוק הגנת הצרכן + commercial best practice | 🚧 Draft live (pending artist + lawyer review) | `/legal/terms` (planned) |
| Privacy Policy | מדיניות פרטיות | חוק הגנת הפרטיות תשמ"א-1981 | 🚧 Draft live (pending artist + lawyer review) | `/legal/privacy` (planned) |
| Returns & Cancellations | מדיניות החזרות וביטולים | חוק הגנת הצרכן — 14-day cooling-off for distance sales | 🚧 Draft live (pending artist + lawyer review) | `/legal/returns` (planned) |
| Shipping Policy | מדיניות משלוחים | Disclosure best practice (delivery times, costs, liability) | 🚧 Draft live (pending artist + lawyer review) | `/legal/shipping` (planned) |
| Accessibility Statement | הצהרת נגישות | תקן ישראלי 5568 (mandatory) | 🚧 Partial | `/legal/accessibility` (live) |

---

## 1. תקנון האתר — Terms of Service

**Why mandatory:** spells out who the seller is, payment terms, warranty/limitation of liability, IP ownership, jurisdiction. Without it, dispute resolution is murky and consumer-protection enforcement leans against the merchant.

**Must include:**
- Identity of the seller — **אלון בר-אל**, עוסק פטור, full address + contact email.
- What's sold (handmade jewelry & home objects, made-to-order may differ from in-stock).
- Pricing in ₪, VAT status (`עוסק פטור` → no VAT).
- Payment methods (Morning hosted form — credit cards via Morning's PCI-DSS infrastructure).
- Order confirmation flow (branded email + Morning receipt).
- Limitation of liability for handmade variation (color, texture, slight size differences are inherent, not defects).
- Governing law: Israeli law; jurisdiction: courts of Tel-Aviv (or artist's residence — confirm).
- Effective date + last updated.

**Drafting:** lawyer ideal. Acceptable fallback: a template service (e.g. Genie AI, Termly localized) reviewed by the artist. **Do not** ship a generic English template translated by Google.

---

## 2. מדיניות פרטיות — Privacy Policy

**Why mandatory:** חוק הגנת הפרטיות + EU GDPR exposure (any EU visitor triggers it). The site collects PII (name, email, shipping address, phone) and IP/cookie data.

**Must cover, at minimum:**
- What's collected: name, email, phone, shipping address, order history, IP, browser fingerprint via cookies.
- Why: order fulfillment, shipping, receipts (Morning), order-confirmation email (Resend or Gmail — current toggle, see [API.md](API.md)).
- Third parties data is shared with:
  - **Morning / Green Invoice** — payment processing + receipts.
  - **Resend** (or **Gmail SMTP**) — order-confirmation email delivery.
  - **Supabase** — data storage (DB + image storage).
  - **Vercel** — hosting + logs.
  - **Google** — admin sign-in only (OAuth); not used for customers.
- Cookies: session cookie (NextAuth, admin only), cart persistence (zustand localStorage, not server-side).
- User rights: access, correction, deletion. Provide the contact email for these requests.
- Retention: how long order/customer data is kept. Suggested: 7 years for tax/Morning compliance.
- Children: site is not directed at under-18s.
- Updates: how changes are communicated (footer "last updated" date).

---

## 3. מדיניות החזרות וביטולים — Returns & Cancellations

**Why mandatory:** חוק הגנת הצרכן grants the buyer 14 days from receipt to cancel distance-sale purchases (with exceptions). The policy must spell out the artist's specific terms within that legal floor.

**Decisions to confirm with the artist (one-time):**
- Full refund vs. partial refund (the meeting checklist offers both options).
- Made-to-order / custom items — by law, **non-cancellable** once production starts. Must be explicit.
- Who pays return shipping (legally the buyer for change-of-mind; the artist for defective).
- Restocking fee (legal up to 5% or ₪100, whichever lower — confirm).
- Refund method (original payment method, via Morning credit-note flow already implemented).
- Time window for the artist to issue the refund (legally up to 14 business days from return receipt).

---

## 4. מדיניות משלוחים — Shipping Policy

**Why:** disclosure obligation + sets customer expectations (Israel Post is unpredictable). Without it, every late delivery becomes a dispute.

**Source of truth:** the values live in `SiteContent` already — `shipping_post_price`, `shipping_post_eta`, `shipping_free_over`, `shipping_pickup_address`, `shipping_pickup_hours`, `shipping_processing_days`. The legal page should render dynamically from these (so updating in admin is reflected on the legal page automatically).

**Must include:**
- Delivery methods: דואר ישראל / איסוף עצמי (from `shipping_pickup_address`).
- Cost per method (₪).
- Processing time before dispatch (`shipping_processing_days` business days).
- Estimated delivery time after dispatch (`shipping_post_eta`).
- Free-shipping threshold if any (`shipping_free_over`).
- What happens if a package is lost (claim window with Israel Post).
- International shipping — currently **not offered**; state so explicitly.

---

## 5. הצהרת נגישות — Accessibility Statement (תקן 5568)

**Why mandatory:** Israeli accessibility standard 5568 applies to commercial sites. Non-compliance is enforced by class actions.

**Current state:** page exists at `/legal/accessibility`. Needs:
- Compliance level claimed (AA per WCAG 2.1 is the target).
- Accessibility-coordinator name + contact (artist must designate someone — likely himself; needs phone + email).
- List of known gaps (the `text-charcoal/40-50` contrast tradeoffs documented in `PROGRESS_LOG.md`).
- Date of last review.
- How users report inaccessibility.

---

## Implementation plan

**Done (2026-05-29):**
1. **Routes** ✅ — four static const pages: `src/app/(storefront)/legal/{terms,privacy,returns,shipping}/page.tsx`. Each is a server component that renders its copy inline (no SiteContent dependency, no Markdown — plain JSX inside a shared `<LegalPage>` shell at `src/components/storefront/LegalPage.tsx`). Decision: kept content in code rather than DB so the artist can't accidentally break formatting; updates ship as PRs.
2. **Admin** ❌ skipped by request — no `legal_*` SiteContent keys, no editor fields.
3. **Footer** ✅ — new dedicated row in `Footer.tsx` linking all four legal pages + the accessibility statement.
4. **Accessibility statement** ✅ — moved from `/accessibility-statement` to `/legal/accessibility` for consistency. No redirect — site is pre-launch with no external indexing to preserve. Linked from the footer alongside the four `/legal/*` pages.

**Cookie banner — intentionally skipped (2026-05-29).** No analytics, no ad pixels, no third-party trackers; cart + a11y prefs live in `localStorage` (not cookies), and the only cookie is NextAuth's strictly-necessary admin session. Israeli law requires disclosure (covered in §5 of the privacy page), not opt-in; GDPR requires consent only for non-essential cookies. **Revisit the moment** Google Analytics, Meta Pixel, Hotjar, or any retargeting tool is added — at that point add a real consent banner (`@klaro/core` or similar) and grow privacy §5 with a "Third-party cookies" subsection.
5. **Sitemap** ✅ — the four `/legal/*` routes added to `src/app/sitemap.ts` (yearly changefreq, priority 0.3).
6. **Robots** ✅ — indexable by default (no `Disallow` covers `/legal`).

**Still required before launch:** every page currently contains a *draft* — generated boilerplate based on the headings in this document. The artist (and ideally a lawyer for terms + privacy) must review and replace every word. Once approved, drop the "🚧 Draft live" status in the table above to ✅.

---

## Open questions for the artist

- Does he want to retain a lawyer for terms + privacy, or use a template service?
- Returns: full refund only, or partial refund cases (used/damaged items)?
- Made-to-order items: confirm non-cancellable wording.
- Accessibility coordinator: name + contact?
- Restocking fee policy?
