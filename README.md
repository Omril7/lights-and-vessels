# אורות וכלים — Lights and Vessels

Full-stack e-commerce site for a handmade crafts & jewelry artist (studio brand **אורות וכלים**, artist **אלון בר-אל**, עוסק פטור).

Includes a public storefront and a private admin panel so the artist can manage products, orders, content, and tax documents without touching code or logging into third-party dashboards.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma + SQLite (dev)
- **Auth:** NextAuth.js (Google OAuth — admin only)
- **Payments & tax docs:** Morning (Green Invoice) — receipts, refunds, reporting
- **Email:** Resend (branded order confirmations)
- **Notifications:** Email + WhatsApp

## Getting Started

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MORNING_API_KEY`, `MORNING_API_SECRET`
- `RESEND_API_KEY`

See [`.claude/spec/ENV.md`](.claude/spec/ENV.md) for the full list.

## Project Structure

```
src/
  app/
    (storefront)/    # public site
    admin/           # admin panel (auth-gated)
    api/             # route handlers
  components/
  lib/
prisma/
public/
.claude/spec/        # project specification
```

## Documentation

Full project specification lives in [`.claude/spec/`](.claude/spec/):

- [OVERVIEW.md](.claude/spec/OVERVIEW.md) — product overview & client decisions
- [FEATURES.md](.claude/spec/FEATURES.md) — feature list
- [API.md](.claude/spec/API.md) — API routes
- [SCHEMA.md](.claude/spec/SCHEMA.md) — database schema
- [PHASES.md](.claude/spec/PHASES.md) — rollout phases
- [PRE_DEPLOY.md](.claude/spec/PRE_DEPLOY.md) — launch checklist
