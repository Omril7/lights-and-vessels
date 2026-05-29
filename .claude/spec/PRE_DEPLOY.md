# Phase 5 — Pre-deploy Checklist

The launch-day playbook. Everything that must be true before the site goes live.

## Account ownership & handoff plan

All third-party accounts must end up under the artist's ownership so that if Omri ever steps away, nothing is locked to a personal account. Decisions, in order to set up on launch day:

| Service | Owner | Omri's access | Notes |
|---|---|---|---|
| **Supabase** (Postgres) | Artist's Google account → his own org | Invited as member of his org | Free-tier project lives in his org, doesn't consume Omri's free slots. Artist holds the billing if ever upgraded. |
| **Vercel** (hosting) | **Shared login** (single account, credentials shared) | Both sign in with the same email/password | Vercel Hobby disallows team members; a shared account is the pragmatic free-tier solution. Use a fresh, dedicated email + a long random password stored in a password manager both share. |
| **Google Cloud / OAuth** | Artist's Google account, project under his account | Added as IAM "Editor" on the GCP project | Production OAuth client (`GOOGLE_CLIENT_ID`/`SECRET`) lives in *his* GCP project — at launch, create a new prod client there and replace the dev keys. |
| **Morning** (Green Invoice — payments + invoicing) | Artist's existing Morning account (his business name, bank, tax ID) | Invited as a user / API key issued to Omri for setup | The client already uses Morning for receipts. API keys generated from *his* account so money + documents stay under his ownership. Replace sandbox creds with prod before launch. |
| **Domain registrar** (when bought) | Artist's account | Optional contact | DNS records pointed at Vercel. |
| **GitHub repo** | Either; transfer to artist's GitHub before handoff or keep on Omri's | Both have push access | Connected to Vercel for auto-deploy. |
| **Email / transactional** (Resend or similar, if added in Phase 3) | Artist's account | Invited member | Sender identity should be the artist's domain. |
| **Password manager** (Bitwarden (free) shared vault) | Shared | Shared | Single source of truth for the Vercel login + all API keys. Create this on day 1 of the handoff. |

## Handoff checklist (the day the site goes live)
1. Artist creates Supabase org → invites Omri.
2. Artist creates GCP project → adds Omri as Editor → generates prod OAuth client.
3. Artist generates Morning **production** API key (key id + secret) from his Morning account → shares via the shared password vault. Confirm doc type (320 / 400) and VAT status on the same call.
4. Shared Vercel account created with a strong password → both store it in the shared password vault → connect to GitHub repo.
5. All prod env vars (below) entered into Vercel from the shared password vault, **not** committed to git.
6. Domain (if any) added to Vercel; DNS pointed.
7. Omri runs final smoke test logged in as himself, then as the artist (the artist is male — use masculine forms in any UI copy added later).

## Environment variables (prod)
- `NEXTAUTH_SECRET` — replace the dev value with a real secret: `openssl rand -base64 32`.
- `NEXTAUTH_URL` — set to the production origin (e.g. `https://studio.example.com`), no trailing slash.
- `DATABASE_URL` — Supabase **transaction pooler** URL (port `6543`, with `?pgbouncer=true&connection_limit=1`). Required for serverless/Vercel.
- `DIRECT_URL` — Supabase **direct connection** URL (port `5432`). Used by `prisma migrate deploy`; pgBouncer can't run migrations. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
- `ADMIN_EMAILS` — comma-separated allowlist of admin Google accounts (artist + Omri).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — production OAuth client (separate from dev recommended).
- `MORNING_API_BASE` — switch from sandbox (`sandbox.d.greeninvoice.co.il`) to prod (`api.greeninvoice.co.il`).
- `MORNING_API_KEY_ID` / `MORNING_API_SECRET` — production credentials from the artist's Morning account.
- `MORNING_PLUGIN_ID` — if required by Morning for hosted payment forms on the merchant account.
- `MORNING_DEFAULT_DOC_TYPE` — confirmed with client (`320` or `400`).
- `CRON_SECRET` — random string; gates `/api/orders/sweep`. Add the same value to the Vercel Cron job header (Bearer) or `?secret=` query.
- `ORDER_RESERVATION_TTL_MINUTES` — defaults to 30; set explicitly if you want a different reservation window.
- **Configure Vercel Cron** to hit `GET /api/orders/sweep` every 5–10 minutes with `Authorization: Bearer <CRON_SECRET>`. Without this, abandoned pending orders never release their stock reservations.
- `MORNING_WEBHOOK_SECRET` — **required for prod** (optional in dev: when unset, the webhook route skips signature verification with a warning). Paste the same string into Morning's webhook "secret" field and into this env var. Morning's field has undocumented validation — if `openssl rand -hex 32` is rejected with `ValidationException: Invalid secret value`, try a shorter alphanumeric value (e.g. `openssl rand -hex 16`).
- `NEXT_PUBLIC_SUPABASE_URL` — prod Supabase project URL (same project as `DATABASE_URL`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — prod anon key. Safe to ship to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` — prod service-role key. **Server-only**; never expose. Used by `/api/upload` to write to the `products` bucket.
- `SUPABASE_STORAGE_BUCKET` — `products` (the public bucket created per [IMAGE_STORAGE.md](IMAGE_STORAGE.md)).

See also: [ENV.md](ENV.md) for dev env vars.

## Google OAuth (Cloud Console)
- Add the production origin to **Authorized JavaScript origins**: `https://studio.example.com`.
- Add the production callback to **Authorized redirect URIs**: `https://studio.example.com/api/auth/callback/google`.
- Move the OAuth consent screen out of "Testing" → "In production" (or keep limited to allowlisted test users, since we gate by email anyway).

## Morning
- In the artist's Morning account, register the prod notify URL (`/api/webhooks/morning`) for hosted payment forms and capture its signing secret into `MORNING_WEBHOOK_SECRET`.
- **If the webhook was first registered against the `vercel.app` default domain**, edit the webhook in Morning at cutover to use the custom domain (e.g. `https://www.lights-and-vessels.com/api/webhooks/morning`). The `vercel.app` URL keeps working post-cutover, but the registered URL should match the production domain so webhooks don't silently break if the Vercel alias is ever disabled.
- Confirm business profile, VAT status, default doc series, email-sender identity, and accepted payment methods (card / Bit / Google Pay) inside Morning.
- Smoke-test a 1 ₪ live transaction end-to-end (checkout → IPN → document issued → email received → refund via credit note) before announcing launch.

## Image uploads
- Product images are stored in the Supabase Storage `products` bucket — see [IMAGE_STORAGE.md](IMAGE_STORAGE.md) for the full setup.
- Confirm before launch: bucket exists, is **public**, file-size limit set (10 MB), MIME allowlist set (`image/jpeg, image/png, image/webp, image/avif`).
- Verify `next.config.js` `images.remotePatterns` includes the prod Supabase hostname (`<project-ref>.supabase.co`).
- Smoke-test from prod admin: upload an image → product page renders it via `next/image` → raw public URL loads in an incognito tab.

## Database
- Run `prisma migrate deploy` against prod (not `db push`).
- Decide whether to run the seed against prod — usually only `SiteContent` defaults and the admin user (which is now unused with Google OAuth — can be removed).

## Hardening
- Confirm `middleware.ts` matchers cover all admin routes; smoke-test logged-out access.
- ~~Set security headers (CSP, X-Frame-Options, Referrer-Policy) in `next.config.js`.~~ ✅ Done — `next.config.js` `headers()` returns HSTS (2y + preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` opting out of camera/mic/geolocation/payment. CSP intentionally deferred — needs a `report-only` shakedown against Next.js inline scripts + Resend/Supabase domains before enforcing.
- Verify `next.config.js` `images.remotePatterns` covers any prod image host.
