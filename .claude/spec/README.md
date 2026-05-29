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
| [LEGAL.md](LEGAL.md) | Must-have Israeli legal pages (terms, privacy, returns, shipping, accessibility) — status, scope, drafting plan |
| [PROGRESS_LOG.md](PROGRESS_LOG.md) | Running record of what's been built (the part that grows) |

---

## What to do next (current status)

**Where we are** (per [PROGRESS_LOG.md](PROGRESS_LOG.md)):
- Phase 1 — Storefront ✅
- Phase 2 — Admin Panel ✅
- Phase 3 — Morning Payments ✅ *code-complete; not yet live-tested*
- Phase 4 — Polish ✅
- Phase 5 — Pre-deploy ❌ *not started*
- Legal pages ([LEGAL.md](LEGAL.md)) 🚧 *scaffolds + boilerplate copy live at `/legal/{terms,privacy,returns,shipping}`; artist must review every word before launch*

### Ordered path to production

Do these in order. Each step is a gate on the next.

1. ~~**Finish Phase 4 — Lighthouse audit.**~~ ✅ Done — see [PROGRESS_LOG.md](PROGRESS_LOG.md) §Phase 4.
2. ~~**Implement admin "new order" email.**~~ ✅ Done — see [PROGRESS_LOG.md](PROGRESS_LOG.md) §Phase 3 webhook.
3. ~~**Legal pages scaffold.**~~ ✅ Done — static const pages live at `/legal/{terms,privacy,returns,shipping}` with boilerplate Hebrew copy; footer + sitemap updated. See [LEGAL.md](LEGAL.md) §Implementation plan.
4. **Artist drafts legal copy** — terms, privacy, returns, shipping. Resolve [LEGAL.md](LEGAL.md) §"Open questions for the artist" first (refund policy, restocking fee, accessibility coordinator, etc.). This is the slow step — kick it off in parallel with step 5.
5. **Phase 3 live sandbox test** — see [PROGRESS_LOG.md](PROGRESS_LOG.md) §"Still needed before live testing":
   - Generate Morning sandbox API key + webhook secret.
   - Deploy to Vercel; register `<vercel-url>/api/webhooks/morning` as the notify URL.
   - Run end-to-end: checkout → IPN → document issued → customer email → admin email (step 2) → refund via credit note.
   - Log the first raw IPN body and tighten the payload parser to match Morning's actual field names + signature header.
6. **Phase 5 — Pre-deploy handoff** ([PRE_DEPLOY.md](PRE_DEPLOY.md)):
   - Artist sets up Supabase org, GCP project + prod OAuth client, Morning **production** API key.
   - Shared Vercel account; shared Bitwarden vault for secrets.
   - Replace all dev env vars with prod values (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL` pooler, `DIRECT_URL`, Morning prod creds, prod Supabase keys).
   - `prisma migrate deploy` against prod DB; seed only `SiteContent` defaults.
   - Domain (if any) → DNS → Vercel.
   - Security headers in `next.config.js`.
7. **Production smoke test** — 1 ₪ live transaction end-to-end on the prod URL with prod Morning creds. Verify customer email, admin email, document PDF, refund.
8. **Launch.**

**Parallelizable:** steps 1, 2, 3 can be done in any order before step 5. Step 4 (artist copywriting) should start as early as possible since it has no engineering blocker.

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
