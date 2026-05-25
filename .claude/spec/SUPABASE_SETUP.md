# Switching from SQLite to Supabase Postgres

Step-by-step checklist to move the app off the local `prisma/dev.db` file onto a Supabase Postgres database.

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
- Admin login (NextAuth → User table).
- Create a product in the admin → appears in `Product` + `ProductImage`.
- Place a test order → row in `Order` + `OrderItem`, Morning webhook updates `MorningDocument`.

---

## 6. Production cutover

1. Create a **separate** Supabase project for prod (do not share with dev).
2. Set `DATABASE_URL` and `DIRECT_URL` in the hosting provider (Vercel → Project Settings → Environment Variables) for the **Production** environment only.
3. Run `npx prisma migrate deploy` against the prod DB (either from CI or locally with prod `DIRECT_URL` exported).
4. Seed admin user (`User` row with `role = "admin"`) via a one-off script — do **not** rely on dev seed data.
5. Enable **Point-in-Time Recovery** in Supabase (paid tier) before launch.

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
