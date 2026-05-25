# Artist E-Commerce Platform — Project Specification

## Overview

Build a full-stack e-commerce website for a **handmade crafts & jewelry artist** — studio brand **"אורות וכלים"** (artist's legal name: **אלון בר-אל**, sole proprietor / **עוסק פטור**). The site must feel like a curated gallery — not a generic Shopify clone. It needs a **public storefront** and a **private admin panel** for the artist to manage everything without touching code.

## Client Profile (confirmed in spec meeting, 2026-05-24)

| Topic | Decision |
|---|---|
| Studio / brand name | **אורות וכלים** |
| Legal name | אלון בר-אל |
| Business status | **עוסק פטור** (no VAT charged or itemized) |
| Default Morning doc type | **`400` — קבלה** (NOT 320) |
| Payment methods to enable in Morning | Credit card, **Bit**, **Google Pay**, **Apple Pay** (PayPal: no) |
| Shipping methods | **דואר ישראל** + **איסוף עצמי** (no courier, no locker). Pricing model still TBD. |
| Branded order-confirmation email | **Yes** — wire Resend in Phase 3 (this is no longer optional). |
| Customer notification channels | Email + WhatsApp (no SMS). |
| WhatsApp number | `+972 52-226-8475` (already in SiteContent seed). |
| Contact email | `alonbarelart@gmail.com` |
| Domain | None yet — buy a `.com` before launch. |
| Logo | **Received** — files in `public/`: `logo-2169x1282-black.png`, `logo-2169x1282-white.png`. |
| Color palette | Earthy default in spec; final palette to be approved by artist post-design. |
| Returns policy | TBD — needs to be written from scratch with the artist. |
| Legal pages (terms / privacy / returns / shipping) | None exist — all four need to be drafted. |
| Accessibility statement | Partial — verify and complete before launch. |
| Maintenance after launch | Artist + Omri jointly. |
| Launch date | Not set. |
| Product catalog | Categories, count, pricing — still TBD with artist. |
| Categories at launch | **None.** All products ship uncategorized (`Product.category` is nullable). Artist will define categories and assign products later — no migration needed. |

Source of truth: `meeting-notes-2026-05-24.json` (exported from `meeting-checklist.html`).

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, NextAuth.js, **Morning (Green Invoice)** for payments + tax documents.

> **Payments provider:** the client already uses Morning (formerly Green Invoice / חשבונית ירוקה — `greeninvoice.co.il`) for issuing receipts. Phase 3 therefore integrates Morning end-to-end — payment collection, automatic document generation (חשבונית/קבלה), refunds via credit notes, and revenue reporting — so the artist manages everything from this app and never needs to log into Morning's own UI. **Stripe is not used.**

See also: [BRANDING.md](BRANDING.md), [FEATURES.md](FEATURES.md), [API.md](API.md), [PHASES.md](PHASES.md).
