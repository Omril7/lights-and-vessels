# /next — Continue i18n Work

You are continuing the Hebrew & English i18n implementation for this Next.js storefront.
The full plan is in `docs/i18n-roadmap.md`. Read it now before doing anything else.

## How to use this command

1. Read `docs/i18n-roadmap.md` to find the first unchecked `- [ ]` item.
2. Identify which phase that belongs to.
3. State the phase and the specific task you are about to do — one sentence.
4. Do it. Mark the checkbox `- [x]` in the roadmap when done.
5. Continue down the checklist until you finish the current phase, then stop and report.

## Key facts (do not re-derive these)

- **Prisma schema** is already updated — all `_he`/`_en` fields are in `prisma/schema.prisma`.
- **Migration SQL** exists at `prisma/migrations/20260621_add_i18n_fields/migration.sql` and is ready to apply.
- **No `[locale]` routes exist yet** — storefront is still at `src/app/(storefront)/`.
- **`next-intl` is not installed yet.**
- Dev-mode project: breaking changes mid-phase are fine. Goal is a clean finished state, not incremental shipping.
- Hebrew is the default locale (RTL). English is secondary (LTR). Admin stays Hebrew-only.
- Fallback rule: if English content is missing, show Hebrew. Never show an empty string.

## Constraints

- Mark each `- [ ]` item `- [x]` in `docs/i18n-roadmap.md` as soon as it is complete.
- Do not skip ahead to a later phase while the current phase has open items.
- After each phase completes, run `npx tsc --noEmit` and fix any errors before proceeding.
- Do not commit — leave that for the user.
