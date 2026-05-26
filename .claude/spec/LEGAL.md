# Legal Documents — Must-Have Before Launch

Israel-specific legal pages that the storefront **must** display before going live to real customers. Source for this list: client meeting checklist section 6 (`meeting-checklist.html`).

All five are linked from the footer. None should ship with lorem-ipsum — every word must be approved by the artist (and ideally a lawyer for terms + privacy).

---

## Status at a glance

| Doc | Hebrew | Legal basis | Status | Route |
|---|---|---|---|---|
| Terms of Service | תקנון האתר | חוק הגנת הצרכן + commercial best practice | ❌ Missing | `/legal/terms` (planned) |
| Privacy Policy | מדיניות פרטיות | חוק הגנת הפרטיות תשמ"א-1981 | ❌ Missing | `/legal/privacy` (planned) |
| Returns & Cancellations | מדיניות החזרות וביטולים | חוק הגנת הצרכן — 14-day cooling-off for distance sales | ❌ Missing | `/legal/returns` (planned) |
| Shipping Policy | מדיניות משלוחים | Disclosure best practice (delivery times, costs, liability) | ❌ Missing | `/legal/shipping` (planned) |
| Accessibility Statement | הצהרת נגישות | תקן ישראלי 5568 (mandatory) | 🚧 Partial | `/accessibility-statement` (live) |

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

**Current state:** page exists at `/accessibility-statement`. Needs:
- Compliance level claimed (AA per WCAG 2.1 is the target).
- Accessibility-coordinator name + contact (artist must designate someone — likely himself; needs phone + email).
- List of known gaps (the `text-charcoal/40-50` contrast tradeoffs documented in `PROGRESS_LOG.md`).
- Date of last review.
- How users report inaccessibility.

---

## Implementation plan

1. **Routes** — add `src/app/(storefront)/legal/[slug]/page.tsx` reading from `SiteContent` keys (`legal_terms`, `legal_privacy`, `legal_returns`, `legal_shipping`). Render with the existing `renderMarkdown()`.
2. **Admin** — add a "מסמכים משפטיים" section in `SiteContentEditor` with `richtext` fields for each (textarea + live preview, like `about_text`).
3. **Footer** — link each page.
4. **Accessibility statement** — leave at `/accessibility-statement` (already linked in the footer), or move under `/legal/` for consistency. Decision pending.
5. **Sitemap** — add the 4 new routes to `src/app/sitemap.ts` once the pages exist.
6. **Robots** — these pages should be indexable (already allowed by default in `src/app/robots.ts`).

**Order of work:** scaffold the routes + admin fields first (an hour). Then the artist drafts the actual text — that's the slow part. Site can launch only once **all five** have real text.

---

## Open questions for the artist

- Does he want to retain a lawyer for terms + privacy, or use a template service?
- Returns: full refund only, or partial refund cases (used/damaged items)?
- Made-to-order items: confirm non-cancellable wording.
- Accessibility coordinator: name + contact?
- Restocking fee policy?
