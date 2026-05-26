# Artist E-Commerce Spec — Index

Split from the original `artist-ecommerce-spec.md`. Open the file that matches what you need.

| File | What's in it |
|---|---|
| [OVERVIEW.md](OVERVIEW.md) | Project summary + Client Profile decisions table (2026-05-24 meeting) |
| [BRANDING.md](BRANDING.md) | Branding assets, design philosophy, Hebrew/RTL rules, responsive rules |
| [FEATURES.md](FEATURES.md) | Shipping, legal pages, accessibility widget, contact/WhatsApp, storefront + admin feature specs |
| [STRUCTURE.md](STRUCTURE.md) | Project directory layout |
| [SCHEMA.md](SCHEMA.md) | Prisma database schema |
| [API.md](API.md) | API routes table + Morning (Green Invoice) integration details |
| [ENV.md](ENV.md) | Environment variables (dev + prod) |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | How to switch from local SQLite to Supabase Postgres (schema diff, env vars, migrations) |
| [IMAGE_STORAGE.md](IMAGE_STORAGE.md) | Product image storage — Supabase Storage `products` bucket, upload API, `next/image` config |
| [PHASES.md](PHASES.md) | Implementation phases 1–4 (the plan) |
| [PRE_DEPLOY.md](PRE_DEPLOY.md) | Phase 5 — launch-day handoff, account ownership, prod env vars, hardening |
| [DEPENDENCIES.md](DEPENDENCIES.md) | npm dependencies + cross-cutting important notes |
| [PROGRESS_LOG.md](PROGRESS_LOG.md) | Running record of what's been built (the part that grows) |

---

## What to do next (current status)

Per [PROGRESS_LOG.md](PROGRESS_LOG.md), Phases 1–3 are **code-complete**. The next step is **live sandbox testing of Phase 3 (Morning payments)** before starting Phase 4.

**To execute the next step:**

1. Read the "Still needed before live testing" section at the bottom of [PROGRESS_LOG.md](PROGRESS_LOG.md) — it lists the exact external setup required (sandbox API keys, webhook secret, ngrok/cloudflared tunnel, etc.).
2. Get sandbox credentials from the artist's Morning account and put them in `.env` (locally) and Vercel env vars.
3. Deploy to Vercel to get a public `*.vercel.app` URL, then register `<vercel-url>/api/webhooks/morning` as the notify URL in Morning sandbox and generate `MORNING_WEBHOOK_SECRET` against that URL.
4. Run a sandbox transaction end-to-end on the Vercel deploy (checkout → IPN → document issued → branded Resend email → admin refund via credit note).
5. Log the raw IPN body on the first ping and tighten `/api/webhooks/morning`'s payload parser to match Morning's actual field names + signature header.
6. Once the sandbox flow is green, mark Phase 3 fully complete in `PROGRESS_LOG.md` and begin **Phase 4 — Polish** ([PHASES.md](PHASES.md)).

---

## Keeping these docs in sync with the code

**Rule: whenever you make a change, update the spec file(s) that document the area you touched — in the same change.** Stale spec is worse than no spec.

Which file to update, by type of change:

| You changed… | Update… |
|---|---|
| `prisma/schema.prisma` (any model/field) | [SCHEMA.md](SCHEMA.md) |
| Added/removed/renamed an `/api/**` route | [API.md](API.md) |
| Changed Morning client / checkout / webhook behavior | [API.md](API.md) + [PROGRESS_LOG.md](PROGRESS_LOG.md) |
| Added a directory, route group, or top-level lib file | [STRUCTURE.md](STRUCTURE.md) |
| Added/renamed/removed an env var | [ENV.md](ENV.md) (and [PRE_DEPLOY.md](PRE_DEPLOY.md) if it ships to prod) |
| Changed database provider / connection setup | [SUPABASE_SETUP.md](SUPABASE_SETUP.md) + [ENV.md](ENV.md) + [PRE_DEPLOY.md](PRE_DEPLOY.md) |
| Changed image upload / storage behavior | [IMAGE_STORAGE.md](IMAGE_STORAGE.md) + [STRUCTURE.md](STRUCTURE.md) + [API.md](API.md) |
| `package.json` deps (added/removed/major bump) | [DEPENDENCIES.md](DEPENDENCIES.md) |
| Storefront or admin UI feature (new page, new component, behavior change) | [FEATURES.md](FEATURES.md) |
| Design tokens, fonts, colors, motion, RTL/responsive rules | [BRANDING.md](BRANDING.md) |
| Client/business decision (doc type, shipping policy, payment methods, etc.) | [OVERVIEW.md](OVERVIEW.md) Client Profile table |
| Plan reshuffle (phase reordered, item added/removed) | [PHASES.md](PHASES.md) |
| Launch / handoff / account-ownership decision | [PRE_DEPLOY.md](PRE_DEPLOY.md) |
| Finished a chunk of work | [PROGRESS_LOG.md](PROGRESS_LOG.md) — append to the relevant phase section |

**Conventions:**
- A single change often touches **two** files (e.g. a new API route → `API.md` + `PROGRESS_LOG.md`). Update both.
- Mark completed work in `PROGRESS_LOG.md` with `✅`, in-progress with `🚧`, blocked/pending with `⏳`.
- Don't leave `TODO` or `TBD` in `PROGRESS_LOG.md` — that belongs in `PHASES.md` (the plan), not the log (what happened).
- When a client decision in `OVERVIEW.md`'s table changes, also strike-through (`~~...~~`) the now-stale text in `PHASES.md` rather than deleting it — preserves the trail.
- Cross-link generously with relative paths (`[SCHEMA.md](SCHEMA.md)`) so jumping between files stays fast.
