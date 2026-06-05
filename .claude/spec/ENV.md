# Environment Variables

## Development (`.env.local`)

```env
# Supabase — transaction pooler (port 6543) for runtime
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
# Supabase — session pooler (port 5432) for `prisma migrate`. Do NOT use db.<ref>.supabase.co directly
# (IPv6-only on free tier; unreachable from most ISPs/Windows). Session pooler is IPv4-compatible.
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres"

NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Public site URL — used by SEO metadata (canonical, OG), sitemap.xml, robots.txt, JSON-LD.
# Must be the full origin without trailing slash. In Vercel set to the production domain.
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Admin allowlist — Google OAuth emails permitted into /admin (comma-separated, lowercase).
ADMIN_EMAILS="artist@example.com,omri@example.com"

# Google OAuth (NextAuth provider)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Morning (Green Invoice)
MORNING_API_BASE="https://sandbox.d.greeninvoice.co.il/api/v1"  # prod: https://api.greeninvoice.co.il/api/v1
MORNING_API_KEY_ID="..."             # sandbox keys from https://sandbox.d.greeninvoice.co.il (prod keys from app.greeninvoice.co.il)
MORNING_API_SECRET="..."             # the secret paired with the key id
MORNING_PLUGIN_ID=""                 # if Morning requires a plugin id for hosted forms
MORNING_DEFAULT_DOC_TYPE="400"       # 400 = קבלה (artist is עוסק פטור). 320 only if moving to עוסק מורשה.
MORNING_WEBHOOK_SECRET="..."         # shared secret used to sign IPN requests (optional in dev; required in prod)

# Stock-reservation sweep (option B inventory model — see FEATURES.md "Inventory & Stock Reservation")
ORDER_RESERVATION_TTL_MINUTES="60"   # how long a pending order holds its stock reservation before the sweep releases it
CRON_SECRET="dev-cron-secret-change-me"   # bearer token guarding /api/orders/sweep. Any long random string works.
                                          # Generate prod value with: openssl rand -hex 32
                                          # Or PowerShell: [Convert]::ToBase64String((1..32 | %{ Get-Random -Maximum 256 }))
                                          # Set the SAME value in Vercel env vars; Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>` automatically.

# Email — order confirmation. Provider is chosen from the admin UI (SiteContent.email_use_gmail).
# EMAIL_PROVIDER is a fallback used only if the DB is unreachable. See API.md "Email confirmation".
EMAIL_PROVIDER="resend"                     # fallback: "resend" or "gmail"
EMAIL_FROM_NAME="אורות וכלים"

# Resend (recommended once a real domain exists — proper DKIM/SPF, professional From address)
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="onboarding@resend.dev"   # dev — switch to hello@<artist-domain> once domain is bought

# Gmail SMTP fallback (no domain needed; From shows as personal Gmail; ~500/day limit).
# Requires 2FA enabled on the Google account + an App Password from https://myaccount.google.com/apppasswords.
GMAIL_USER=""                # e.g. you@gmail.com
GMAIL_APP_PASSWORD=""        # 16-char App Password — NOT the Google account password

# Supabase Storage (product images — see IMAGE_STORAGE.md)
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."          # safe to expose client-side
SUPABASE_SERVICE_ROLE_KEY="..."              # SERVER ONLY — bypasses RLS, treat like a DB password
SUPABASE_STORAGE_BUCKET="site-images"        # public bucket name; uploads written under products/<year>/ or content/<year>/
```

## Production

See the Phase 5 pre-deploy checklist in [PHASES.md](PHASES.md) for the full production env-var list (Google OAuth client, Supabase Postgres URL, admin allowlist, prod Morning credentials, etc.).

On Supabase, both `DATABASE_URL` (transaction pooler, port 6543, `?pgbouncer=true&connection_limit=1`) and `DIRECT_URL` (direct connection, port 5432, used by `prisma migrate`) must be set. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
