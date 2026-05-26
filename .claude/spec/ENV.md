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

# Admin allowlist — Google OAuth emails permitted into /admin (comma-separated, lowercase).
ADMIN_EMAILS="artist@example.com,omri@example.com"

# Google OAuth (NextAuth provider)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Morning (Green Invoice)
MORNING_API_BASE="https://sandbox.d.greeninvoice.co.il/api/v1"  # prod: https://api.greeninvoice.co.il/api/v1
MORNING_API_KEY_ID="..."             # from Morning admin → API keys
MORNING_API_SECRET="..."             # the secret paired with the key id
MORNING_PLUGIN_ID=""                 # if Morning requires a plugin id for hosted forms
MORNING_DEFAULT_DOC_TYPE="400"       # 400 = קבלה (artist is עוסק פטור). 320 only if moving to עוסק מורשה.
MORNING_WEBHOOK_SECRET="..."         # shared secret used to sign IPN requests

# Resend (branded order-confirmation email — required)
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="onboarding@resend.dev"   # dev — switch to hello@<artist-domain> once domain is bought

# Supabase Storage (product images — see IMAGE_STORAGE.md)
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."          # safe to expose client-side
SUPABASE_SERVICE_ROLE_KEY="..."              # SERVER ONLY — bypasses RLS, treat like a DB password
SUPABASE_STORAGE_BUCKET="products"           # public bucket name
```

## Production

See the Phase 5 pre-deploy checklist in [PHASES.md](PHASES.md) for the full production env-var list (Google OAuth client, Supabase Postgres URL, admin allowlist, prod Morning credentials, etc.).

On Supabase, both `DATABASE_URL` (transaction pooler, port 6543, `?pgbouncer=true&connection_limit=1`) and `DIRECT_URL` (direct connection, port 5432, used by `prisma migrate`) must be set. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
