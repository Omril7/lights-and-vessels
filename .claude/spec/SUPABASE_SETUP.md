# Supabase Setup (Postgres + Storage)

Step-by-step checklist to move the app off the local `prisma/dev.db` file onto a Supabase Postgres database, and to host product images in the same project's Storage bucket.

Supabase is used for two things in this project:
- **Postgres database** (this doc) — primary data store via Prisma.
- **Storage `products` bucket** — product images uploaded by the admin. Setup details in [IMAGE_STORAGE.md](IMAGE_STORAGE.md); env vars in [ENV.md](ENV.md).

Both live in the same Supabase project (one project for dev and prod — see §6).

---

## 1. Create the Supabase project

1. Go to https://supabase.com → New Project. Pick a region close to the artist (eu-central-1 / Frankfurt is fine for Israel).
2. Save the database password somewhere safe — you cannot recover it later.
3. In **Project Settings → Database → Connection string**, grab two URIs:
   - **Transaction pooler** (port `6543`) — used by the app at runtime.
   - **Direct connection** (port `5432`) — used by Prisma for migrations.

---

## 2. Update `prisma/schema.prisma`

Exact diff:

```diff
 datasource db {
-  provider = "sqlite"
-  url      = env("DATABASE_URL")
+  provider  = "postgresql"
+  url       = env("DATABASE_URL")
+  directUrl = env("DIRECT_URL")
 }
```

No other schema changes are required — the current models use only portable types (`String`, `Int`, `Float`, `Boolean`, `DateTime`). Prisma maps them to `text`, `integer`, `double precision`, `boolean`, `timestamp(3)` in Postgres automatically.

> Optional follow-up (not required to migrate): consider switching `price`, `comparePrice`, `subtotal`, `shippingCost`, `total`, and `MorningDocument.amount` from `Float` to `Decimal @db.Decimal(10, 2)`. Postgres supports exact decimals, and money in floats is a known footgun. Do this in a follow-up migration, not as part of the cutover.

---

## 3. Update env vars

### `.env.local` (dev, pointing at Supabase dev project)

```env
# Supabase — transaction pooler (port 6543) with pgbouncer flag
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase — direct connection (port 5432), used by `prisma migrate`
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

Why two URLs:
- Next.js API routes / server actions run in short-lived workers → must go through the pgBouncer pooler or Postgres will run out of connections.
- `prisma migrate` needs prepared statements, which pgBouncer in transaction mode does not support → must use the direct URL.

Also update `.claude/spec/ENV.md` to document `DIRECT_URL` next to `DATABASE_URL`.

---

## 4. Reset Prisma migrations

SQLite migrations are not compatible with Postgres — they contain SQLite-specific SQL. Throw them out and regenerate:

```bash
# 1. delete old migrations + the local sqlite file
rm -rf prisma/migrations
rm -f  prisma/dev.db prisma/dev.db-journal

# 2. generate a fresh initial migration against Supabase
npx prisma migrate dev --name init

# 3. regenerate the client (usually automatic, but safe to run)
npx prisma generate
```

If you have data in the SQLite file you want to keep, dump it first via a small script (Prisma read from sqlite → Prisma write to postgres). For a fresh project with only test data, just re-seed:

```bash
npx prisma db seed
```

---

## 5. Verify

```bash
npx prisma studio          # should connect to Supabase, show empty tables
npm run dev                # app should boot, sign-in should work
```

Smoke-test:
- Admin login (Google OAuth — email must be in `ADMIN_EMAILS`).
- Create a product in the admin → appears in `Product` + `ProductImage`.
- Place a test order → row in `Order` + `OrderItem`, Morning webhook updates `MorningDocument`.

---

## 6. Production cutover

Plan: **reuse the dev Supabase project** for prod (single-project setup). Before launch, reset and re-seed with prod data.

1. Set `DATABASE_URL` and `DIRECT_URL` in Vercel → Project Settings → Environment Variables (same values as dev; both pooler URLs).
2. Pre-launch reset (run locally against the project once content is finalized):
   - `npx prisma migrate reset` — drops all tables, re-applies migrations, runs seed.
   - Then re-create/import the artist's real products via the admin UI.
3. Enable **Point-in-Time Recovery** in Supabase (paid tier) before launch.

> Tradeoff vs. two-project setup: no isolated staging, no fallback if cutover breaks, dev/prod credentials are shared. Acceptable given there are no customer accounts and the artist will populate prod data manually.

### Direct connection note
Do **not** use `db.<ref>.supabase.co:5432` for `DIRECT_URL` — that host is IPv6-only on Supabase's free tier and unreachable from most ISPs/Windows machines. Use the **Session pooler** (`aws-1-<region>.pooler.supabase.com:5432`) instead.

---

## 7. Cleanup

- Remove `prisma/dev.db` from the repo if it was ever committed; add `prisma/*.db*` to `.gitignore`.
- Grep for any lingering references to `sqlite` / `dev.db` in code.
- Update PHASES.md Phase 5 checklist to mark the Supabase swap as done.

---

## Rollback

If something breaks after cutover:
1. Revert the `schema.prisma` diff.
2. Restore `DATABASE_URL="file:./dev.db"` in `.env.local`.
3. `npx prisma generate`.
4. App is back on SQLite. Supabase project can stay — it costs nothing on the free tier.
