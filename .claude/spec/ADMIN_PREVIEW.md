# Admin: Site Content Preview Mode

## What & Why

The admin edits site content in `/admin/site-content` and currently saves directly to production with no way to preview first. This feature adds a **"תצוגה מקדימה"** (Preview) button that lets the admin browse the **full storefront** — home, about, footer, banner, etc. — with their unsaved edits before deciding to save or discard.

Only the admin's browser sees the preview. Public visitors are unaffected. When done, the admin clicks "יציאה מתצוגה" and the draft is cleared from the DB.

---

## Architecture

### Why server-side draft storage
When the admin opens a preview tab, the browser makes a fresh server request. Edits sitting in the admin's in-browser state are invisible to that new request, so the draft must be stored on the server. Per design: **dedicated `SiteContentDraft` table**, populated on Preview, cleared on exit.

### Mechanism: Next.js Draft Mode
Use Next.js built-in **Draft Mode** (`draftMode()` from `next/headers`, synchronous in Next 14.2.x). It sets a per-browser `__prerender_bypass` cookie so only the admin's browser is "in preview". `getSiteContent()` overlays the draft table when `draftMode().isEnabled`. Since all storefront pages already declare `export const dynamic = "force-dynamic"`, there is **no** performance regression from reading `draftMode()`.

Preview opens in a new **tab** (not an iframe), so the global `X-Frame-Options: DENY` header in `next.config.js` is irrelevant.

---

## Implementation Plan

### 1. DB — `prisma/schema.prisma`

Add a new model mirroring `SiteContent` (keyed by `key`):

```prisma
model SiteContentDraft {
  key       String   @id
  value     String
  type      String   @default("text")
  updatedAt DateTime @updatedAt
}
```

Then run:
```bash
npx prisma migrate dev --name add_site_content_draft
```

This generates a migration in `prisma/migrations/` and regenerates the Prisma client.

---

### 2. Draft-aware content loader — `src/lib/content.ts`

Add an `allowDraft` option (default `true`) so the storefront overlays the draft when preview mode is on, while the admin editor always loads from production.

```ts
import { draftMode } from "next/headers";

export async function getSiteContent(
  opts: { allowDraft?: boolean } = {}
): Promise<SiteContentMap> {
  const { allowDraft = true } = opts;
  const map: SiteContentMap = { ...FALLBACKS };
  const rows = await prisma.siteContent.findMany();
  for (const row of rows) map[row.key] = row.value;
  if (allowDraft && draftMode().isEnabled) {
    const drafts = await prisma.siteContentDraft.findMany();
    for (const row of drafts) map[row.key] = row.value;
  }
  return map;
}
```

---

### 3. Preview API — `src/app/api/site-content/preview/route.ts` *(new file)*

Reuses `requireAdmin` (from `src/lib/admin`) and the same `entries` zod schema shape as the existing `PUT /api/site-content`.

**POST** (save draft + enable preview):
1. `requireAdmin` guard.
2. Validate `{ entries: [{ key, value, type? }] }` with zod.
3. In a transaction: `deleteMany({})` all draft rows, then `createMany()` with the new entries.
4. `draftMode().enable()`.
5. Return `{ ok: true }`.

**DELETE** (exit preview):
1. `requireAdmin` guard.
2. `draftMode().disable()`.
3. `prisma.siteContentDraft.deleteMany({})`.
4. Return `{ ok: true }`.

Note: No image cleanup on preview — drafts never permanently delete images. Only the real `PUT /api/site-content` does image cleanup.

---

### 4. Admin "Preview" button — `src/components/admin/SiteContentEditor.tsx`

**Extract** the `entries` builder from `save()` into a shared helper:
```ts
function buildEntries(values: Record<string, string>) {
  return SECTIONS.flatMap((s) =>
    s.fields.map((f) => ({
      key: f.key,
      value: values[f.key] ?? "",
      type: f.kind === "richtext" ? "richtext" : "text",
    }))
  );
}
```

**Add a `preview()` function** (note: open the tab synchronously first to avoid popup blockers — browsers block `window.open` in async callbacks):
```ts
async function preview() {
  const w = window.open("", "_blank");
  try {
    const res = await fetch("/api/site-content/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: buildEntries(values) }),
    });
    if (!res.ok) throw new Error("שגיאה");
    if (w) w.location.href = "/";
    else toast.error("חסימת חלון קופץ — אפשר חלונות קופצים ונסה שוב");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "שגיאה בתצוגה מקדימה");
    w?.close();
  }
}
```

**In the floating bottom bar** (already rendered at bottom of component), add the button left of the Save button:
```tsx
<Button variant="outline" onClick={preview} disabled={saving}>
  תצוגה מקדימה
</Button>
```

---

### 5. Storefront preview banner

**`src/app/(storefront)/layout.tsx`** (server component):
Read draft mode and render the banner:
```tsx
import { draftMode } from "next/headers";
import { PreviewBanner } from "@/components/storefront/PreviewBanner";

// inside StorefrontLayout:
const isPreview = draftMode().isEnabled;
// ... existing JSX ...
{isPreview && <PreviewBanner />}
```

**`src/components/storefront/PreviewBanner.tsx`** *(new client component)*:
- Fixed pill at **bottom-center** (avoids covering existing content, distinct from the admin save-bar which appears on the admin domain).
- Hebrew text: *"מצב תצוגה מקדימה — השינויים עדיין לא נשמרו"*
- **"יציאה מתצוגה"** button: calls `DELETE /api/site-content/preview`, then `window.location.assign("/")` (reload clears draft mode cookie, banner disappears).
- Use `z-50` so it floats above storefront content; style to be visually distinct (e.g. copper/charcoal background, white text).

```tsx
"use client";
async function exitPreview() {
  await fetch("/api/site-content/preview", { method: "DELETE" });
  window.location.assign("/");
}
```

---

### 6. Admin editor always loads production — `src/app/admin/site-content/page.tsx`

Change the data fetch call to:
```ts
const content = await getSiteContent({ allowDraft: false });
```

This ensures even if the admin has a live preview cookie, the editor always seeds from production values (no confusion between what's live vs. what's being edited).

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `SiteContentDraft` model |
| `prisma/migrations/…` | Generated by `migrate dev` |
| `src/lib/content.ts` | `allowDraft` option + draft overlay |
| `src/app/api/site-content/preview/route.ts` | **New** — POST (save draft) + DELETE (exit) |
| `src/components/admin/SiteContentEditor.tsx` | `buildEntries()` helper + Preview button |
| `src/app/(storefront)/layout.tsx` | Read `draftMode`, render `<PreviewBanner>` |
| `src/components/storefront/PreviewBanner.tsx` | **New** — fixed banner with exit button |
| `src/app/admin/site-content/page.tsx` | Pass `allowDraft: false` |

---

## Out of Scope

- Product/blog data — preview covers **site content keys only** (the `SiteContent` table). Products and posts are not affected.
- Preview does not support multiple concurrent drafts — only one draft at a time, tied to the single admin session.

---

## Verification Steps

1. `npx prisma migrate dev --name add_site_content_draft` → succeeds, client regenerated.
2. `npx tsc --noEmit` → clean.
3. `npm run dev`, log in as admin, open `/admin/site-content`.
4. Change hero title, click **תצוגה מקדימה** → new tab opens at `/` showing the new hero text.
5. Open an incognito tab at `/` → still shows the old (production) hero.
6. In the preview tab, navigate to `/about` → about content edits also visible (full-site coverage).
7. The preview banner is visible at the bottom.
8. Click **"יציאה מתצוגה"** → reloads to `/`, banner gone, production content shown. Confirm `SiteContentDraft` table is empty in DB.
9. Back in admin, click **שמירת השינויים** → normal save works as before (existing image cleanup runs on the real `PUT`).
