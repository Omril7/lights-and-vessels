# i18n Roadmap — Hebrew & English

## Overview

**Goal:** Full Hebrew + English bilingual support across the storefront. Admin UI stays Hebrew-only, but all content forms gain bilingual input fields.

**Library:** [`next-intl`](https://next-intl.dev/) — the standard for Next.js App Router i18n.

**URL strategy:** Locale prefix on every storefront route.
```
/he/          ← Hebrew (default, RTL)
/en/          ← English (LTR)
/admin/...    ← No locale prefix, Hebrew UI only
```

**Dev mode note:** The site is not deployed or production-ready. Breaking changes (route restructuring, DB column renames, TypeScript errors mid-migration) are acceptable — the goal is to finish in a clean state, not to ship incrementally.

**Fallback rule:** If English content is missing for a field, fall back to Hebrew. Never show an empty string.

---

## Phases at a Glance

| # | Phase | Scope | Complexity |
|---|---|---|---|
| 1 | Install & configure `next-intl` | Setup | Low |
| 2 | Route restructure — move to `[locale]` | Infrastructure | High |
| 3 | DB migration — rename & add `_he`/`_en` columns | Database | Medium |
| 4 | Fix TypeScript compilation after migration | Code | Medium |
| 5 | Extract static UI strings to messages files | Code | High (volume) |
| 6 | Locale-aware dynamic content reads | Code | Medium |
| 7 | Admin bilingual content forms | Admin UI | High |
| 8 | Legal pages — per-locale Markdown files | Content | Low |
| 9 | Language switcher in Navbar | UI | Low |
| 10 | SEO — metadata, sitemap, hreflang | SEO | Medium |
| 11 | Order emails in customer's language | Backend | Medium |

---

## Phase 1 — Install & Configure `next-intl`

> **Prerequisite for everything.** No user-visible changes yet.

- [x] Install dependency: `npm install next-intl`
- [x] Create `src/i18n/routing.ts`
  ```ts
  import { defineRouting } from 'next-intl/routing';
  export const routing = defineRouting({
    locales: ['he', 'en'],
    defaultLocale: 'he',
  });
  ```
- [x] Create `src/i18n/request.ts` (server-side locale resolution)
  ```ts
  import { getRequestConfig } from 'next-intl/server';
  import { routing } from './routing';
  export default getRequestConfig(async ({ requestLocale }) => {
    const locale = (await requestLocale) ?? routing.defaultLocale;
    return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default,
    };
  });
  ```
- [x] Create `messages/he.json` — empty object `{}` for now (filled in Phase 5)
- [x] Create `messages/en.json` — empty object `{}` for now (filled in Phase 5)
- [x] Wrap `next.config.ts` with the `next-intl` plugin:
  ```ts
  import createNextIntlPlugin from 'next-intl/plugin';
  const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
  export default withNextIntl(nextConfig);
  ```

---

## Phase 2 — Route Restructure: Move Storefront to `[locale]`

> **Biggest structural change.** App will be broken mid-phase until middleware is done.
> Admin routes (`/admin/...`) stay at root — they are excluded from locale handling.

### 2a — Move storefront route files

- [x] Create `src/app/[locale]/` directory
- [x] Move `src/app/(storefront)/` → `src/app/[locale]/(storefront)/`
  - This moves all 15 storefront pages under the locale segment
- [x] Move `src/app/not-found.tsx` → `src/app/[locale]/not-found.tsx`
- [x] Move `src/app/error.tsx` → `src/app/[locale]/error.tsx`
- [x] Keep `src/app/admin/` at its current path (no locale prefix)
- [x] Keep `src/app/api/` at its current path (no locale prefix)

**Directory result:**
```
src/app/
  layout.tsx                      ← root layout (kept, simplified)
  [locale]/
    layout.tsx                    ← locale-aware layout (lang, dir, fonts, providers)
    (storefront)/
      layout.tsx                  ← storefront shell (navbar, footer)
      page.tsx                    ← /he/ and /en/
      about/page.tsx
      shop/page.tsx
      shop/[slug]/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
      cart/page.tsx
      checkout/
        page.tsx
        success/page.tsx
        failed/page.tsx
      legal/
        privacy/page.tsx
        terms/page.tsx
        returns/page.tsx
        shipping/page.tsx
        accessibility/page.tsx
    not-found.tsx
    error.tsx
  admin/                          ← unchanged
  api/                            ← unchanged
```

### 2b — Update root layout

- [x] `src/app/layout.tsx` — strip to bare minimum (just `<html>` with no lang/dir hardcoded here; the `[locale]/layout.tsx` handles those)

### 2c — Create locale layout

- [x] `src/app/[locale]/layout.tsx`:
  - Accept `params: Promise<{ locale: string }>`
  - Set `<html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'}>`
  - Wrap with `NextIntlClientProvider`
  - Load locale-appropriate fonts (Frank Ruhl for both, Assistant for both — both support Latin)

### 2d — Update middleware

- [x] `src/middleware.ts` — integrate `next-intl` routing with existing NextAuth middleware:
  - Locale detection runs for all paths **except** `/admin/...` and `/api/...`
  - Redirect bare `/` → `/he/`
  - Admin auth check stays on `/admin/...` paths
  - Use `next-intl`'s `createNavigation` for locale-aware routing helpers

### 2e — Update all internal `<Link>` and `router.push()` calls in storefront

- [x] Replace `next/link` imports with `next-intl`'s `Link` in all storefront components
- [x] Replace `next/navigation`'s `useRouter` / `usePathname` with `next-intl`'s equivalents
- [x] Storefront components affected:
  - `Navbar.tsx`
  - `Footer.tsx`
  - `CartDrawer.tsx`
  - `ProductCard.tsx`
  - `BlogCard.tsx`
  - Any component using `router.push()` or `<Link href="...">`

---

## Phase 3 — Database Migration

> Safe to run because the app is in dev mode. After this phase, the app **will not compile** until Phase 4 is done.

### 3a — Run the SQL migration

- [x] Apply `prisma/migrations/20260621_add_i18n_fields/migration.sql` against the dev database
- [x] Also applied `prisma/migrations/20260622_fix_blog_post_image_alt/migration.sql` (BlogPostImage.alt was missing from the original)
- [x] Verify no data was lost: spot-check a product, blog post, and site content row

### 3b — Regenerate Prisma client

- [x] `npx prisma generate`

### What changed in the schema

| Model | Old field | New field(s) |
|---|---|---|
| `Product` | `name` | `name_he` (required), `name_en` (optional) |
| `Product` | `description` | `description_he` (required), `description_en` (optional) |
| `Product` | `tags` | `tags_he` (optional), `tags_en` (optional) |
| `ProductImage` | `alt` | `alt_he` (optional), `alt_en` (optional) |
| `BlogPostImage` | `alt` | `alt_he` (optional), `alt_en` (optional) |
| `BlogPost` | `title` | `title_he` (required), `title_en` (optional) |
| `BlogPost` | `excerpt` | `excerpt_he` (required), `excerpt_en` (optional) |
| `BlogPost` | `body` | `body_he` (required), `body_en` (optional) |
| `BlogTag` | `name` | `name_he` (required, unique), `name_en` (optional) |
| `SiteContent` | `value` | `value_he` (required), `value_en` (optional) |
| `SiteContentDraft` | `value` | `value_he` (required), `value_en` (optional) |
| `Order` | _(new)_ | `locale` String, default `"he"` |

---

## Phase 4 — Fix TypeScript Compilation After Migration

> The renamed Prisma fields will cause TypeScript errors everywhere the old field names are referenced. Fix them all before moving on.

### 4a — Add a locale helper utility

- [x] Add to `src/lib/utils.ts`:
  ```ts
  export function localize<T extends Record<string, unknown>>(
    obj: T,
    field: string,
    locale: string
  ): string {
    const localized = obj[`${field}_${locale}`] as string | null | undefined;
    const fallback = obj[`${field}_he`] as string;
    return localized ?? fallback;
  }
  ```
  Usage: `localize(product, 'name', locale)` → returns `product.name_en ?? product.name_he`

### 4b — Fix all API routes

- [x] `src/app/api/admin/products/` — update all reads/writes to use `name_he`, `description_he`, etc.
- [x] `src/app/api/admin/blog/` — update title, excerpt, body field names
- [x] `src/app/api/admin/blog/tags/` — update `name` → `name_he`
- [x] `src/app/api/admin/site-content/` — update `value` → `value_he`
- [x] `src/app/api/checkout/` — no field renames, but add `locale` to Order creation
- [x] Any other API routes that query Product, BlogPost, BlogTag, SiteContent

### 4c — Fix all components and pages

> At this point just fix the field names — don't add locale-awareness yet (that's Phase 6).
> Use `name_he` as the single source until locale-aware reads are wired up.

- [x] `src/components/storefront/ProductCard.tsx` — `product.name` → `product.name_he`
- [x] `src/components/storefront/BlogCard.tsx` — `post.title` → `post.title_he`
- [x] `src/components/storefront/FeaturedProducts.tsx`
- [x] All other storefront components receiving Product or BlogPost props
- [x] `src/app/[locale]/(storefront)/shop/[slug]/page.tsx`
- [x] `src/app/[locale]/(storefront)/blog/[slug]/page.tsx`
- [x] `src/lib/content.ts` — `content.value` → `content.value_he`
- [x] `src/types/index.ts` — update `ProductWithImages` and any other shared types
- [x] Admin components:
  - `src/components/admin/ProductForm.tsx` — `name` → `name_he`, `description` → `description_he`
  - `src/components/admin/BlogForm.tsx` — `title` → `title_he`, etc.
  - `src/components/admin/SiteContentEditor.tsx` — `value` → `value_he`

- [x] **Verify:** `npx tsc --noEmit` passes with 0 errors before proceeding

---

## Phase 5 — Extract Static UI Strings to Translation Files

> This phase has the highest volume of changes — roughly 500 strings across ~45 files.
> Work component by component. For each: add keys to `messages/he.json` and `messages/en.json`, then use `useTranslations` / `getTranslations` in the component.

**Pattern for client components:**
```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('nav');
// then: t('home') → "בית" / "Home"
```

**Pattern for server components:**
```tsx
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('nav');
```

### 5a — Navigation & chrome

- [x] `Navbar.tsx` — nav link labels, cart label/count
- [x] `Footer.tsx` — nav labels, legal link labels, copyright/tagline
- [x] `src/app/[locale]/(storefront)/layout.tsx` — any layout-level strings

### 5b — Product pages

- [x] `ProductCard.tsx` — "הוסף לסל", out-of-stock label, price formatting
- [x] `src/app/[locale]/(storefront)/shop/page.tsx` — heading, empty state, filter labels
- [x] `src/app/[locale]/(storefront)/shop/[slug]/page.tsx` — add-to-cart, stock, quantity, shipping snippet

### 5c — Blog pages

- [x] `BlogCard.tsx` — "קרא עוד", date label
- [x] `src/app/[locale]/(storefront)/blog/page.tsx` — heading, tag filter, empty state
- [x] `src/app/[locale]/(storefront)/blog/[slug]/page.tsx` — author label, date label, back link, tag labels

### 5d — Cart & checkout

- [x] `CartDrawer.tsx` — title, empty state, item count, subtotal, checkout button
- [x] `src/app/[locale]/(storefront)/cart/page.tsx` — all headings and labels
- [x] `CheckoutForm.tsx` — all section headings, field labels, placeholders, shipping option labels, submit button
- [x] `src/app/[locale]/(storefront)/checkout/success/page.tsx` — success message, CTA
- [x] `src/app/[locale]/(storefront)/checkout/failed/page.tsx` — error message, retry CTA

### 5e — Home page sections

- [x] `HeroBanner.tsx` — CTA button text (note: hero title/subtitle come from SiteContent — handled in Phase 6)
- [x] `FeaturedProducts.tsx` — section heading
- [x] `Testimonials.tsx` — section heading (testimonial quotes come from SiteContent JSON — handled in Phase 6)
- [x] `CategoryStrip.tsx` — category display names
- [x] `ContactSection.tsx` — heading, body text, email label

### 5f — Static pages

- [x] `src/app/[locale]/(storefront)/about/page.tsx` — any hardcoded strings (content itself comes from SiteContent)

### 5g — Error & utility pages

- [x] `src/app/[locale]/not-found.tsx` — message, back link
- [x] `src/app/[locale]/error.tsx` — message, retry button
- [x] `global-error.tsx` — imports `messages/he.json` directly (renders outside NextIntlClientProvider)

### 5h — Accessibility widget

- [x] `AccessibilityWidget.tsx` — all option labels (contrast, dark mode, etc.)

### 5i — messages files structure

Build `messages/he.json` and `messages/en.json` in parallel as you go. Suggested namespace structure:

```json
{
  "nav": { "home": "", "shop": "", "blog": "", "about": "", "cart": "" },
  "cart": { "title": "", "empty": "", "checkout": "", "items": "" },
  "checkout": { "contact": "", "shipping": "", "submit": "", ... },
  "product": { "addToCart": "", "outOfStock": "", "quantity": "" },
  "blog": { "readMore": "", "by": "", "tags": "" },
  "home": { "featuredHeading": "", "testimonialsHeading": "" },
  "contact": { "heading": "", "body": "" },
  "legal": { "backToHome": "" },
  "a11y": { "contrast": "", "dark": "", "fontSize": "" },
  "errors": { "notFound": "", "notFoundBack": "", "error": "", "retry": "" }
}
```

---

## Phase 6 — Locale-aware Dynamic Content Reads

> Wire up the `localize()` helper everywhere dynamic content is served from the DB.

### 6a — `src/lib/content.ts`

- [x] `getSiteContent` accepts `{ locale? }` — returns `value_en ?? value_he` when locale is not 'he'
- [x] `parseTestimonials(value, locale)` — picks `quote_en`, `name_en`, `detail_en` when present
- [x] `parseGallery(value, locale)` — picks `alt_en` when present
- [x] All call sites pass locale via `getLocale()` / `useLocale()`

### 6b — Products

- [x] `ProductCard.tsx` — uses `useLocale()` + `localize(product, 'name', locale)` for name and image alts
- [x] `src/app/[locale]/(storefront)/shop/[slug]/page.tsx` — `localize()` for name, description, tags, image alts
- [x] `src/app/[locale]/(storefront)/checkout/success/page.tsx` — `localize()` for order item product names

### 6c — Blog posts

- [x] `src/app/[locale]/(storefront)/blog/page.tsx` — `localize()` for title, excerpt, tag names
- [x] `src/app/[locale]/(storefront)/blog/[slug]/page.tsx` — `localize()` for title, excerpt, body, tag names, image alts
- [x] `BlogCard.tsx` — locale-aware `formatDate(date, locale)`

### 6d — Blog tags

- [x] All tag rendering passes `localize(tag, 'name', locale)` to BlogTagFilter and BlogCard

### 6e — SiteContent JSON fields (testimonials, process_gallery, etc.)

- [x] `parseTestimonials` and `parseGallery` support `_en` sub-fields in JSON blobs
- [x] `Testimonials.tsx` and `CategoryStrip.tsx` pass locale to `getSiteContent`
- [x] `src/lib/utils.ts` — `formatDate` accepts locale param (he-IL vs en-US)
- [x] Home page, About page, Checkout page pass locale to `getSiteContent`

---

## Phase 7 — Admin Bilingual Content Forms

> Admin UI labels and chrome stay Hebrew. Only the content input fields become bilingual.
> Suggested UX: two-column layout (Hebrew | English).
> UI Inputs: use `LocalizedInput` & `LocalizedTextarea` for bilingual fields (renders flag + sets `dir`). Use plain `Input` & `Textarea` for single-language fields (slug, author, price, etc.).

### 7a — `ProductForm.tsx`

- [x] Split `name` input → two inputs: `name_he` (required, labelled "שם בעברית") + `name_en` (optional, labelled "Name in English")
- [x] Split `description` textarea → `description_he` + `description_en`
- [x] Split `tags` input → `tags_he` + `tags_en`
- [x] Update form submit to send both fields
- [x] Update `src/app/api/admin/products/route.ts` (POST + PUT) to accept and save both fields

### 7b — `BlogForm.tsx`

- [x] Split `title` → `title_he` + `title_en`
- [x] Split `excerpt` → `excerpt_he` + `excerpt_en`
- [x] Split `body` Markdown editor → two editors side by side or tabbed: `body_he` + `body_en`
- [x] Update `src/app/api/admin/blog/route.ts` to accept both fields

### 7c — Blog tag form (`/admin/blog/tags`)

- [x] Add `name_en` input next to existing `name_he` input
- [x] Update `src/app/api/admin/blog/tags/route.ts`

### 7d — `SiteContentEditor.tsx`

> This is the most complex admin change — the 46KB editor manages many content types.

- [x] For each editable content block: add a second field `value_en` next to `value_he`
- [x] Non-translatable keys (feature flags: `banner_enabled`, `email_use_gmail`, `shipping_*` prices) — show only the `value_he` field (no English counterpart needed)
- [x] For JSON-type keys (testimonials, process_gallery, social_links): add `_en` sub-fields inside the JSON editor per object
- [x] Update `src/app/api/admin/site-content/route.ts` to accept and save `value_en`
- [x] Update SiteContentDraft logic likewise

---

## Phase 8 — Legal Pages: Per-locale Markdown Files

> Legal content is long, version-controlled, and rarely changes — better stored as files than in the CMS.

### 8a — Create content files

- [x] Create directory `src/content/legal/`
- [x] Create the following files (content to be written separately):
  - [x] `privacy-he.md`
  - [x] `privacy-en.md`
  - [x] `terms-he.md`
  - [x] `terms-en.md`
  - [x] `returns-he.md`
  - [x] `returns-en.md`
  - [x] `shipping-he.md`
  - [x] `shipping-en.md`
  - [x] `accessibility-he.md`
  - [x] `accessibility-en.md`

### 8b — Update legal page components

- [x] Each of the 5 legal pages reads `src/content/legal/{page}-{locale}.md` using `fs.readFileSync`
- [x] Render with a Markdown renderer (`react-markdown` already present for the blog)
- [x] Shared `LegalPage` layout component already existed; made async + wired up `getTranslations('legal')` for chrome strings

---

## Phase 9 — Language Switcher in Navbar

### 9a — Component

- [x] Create `src/components/storefront/LanguageSwitcher.tsx`
  - Shows a flag toggle switch using `IsraelFlag` and `UsaFlag` from `src/lib/flags.tsx` (not text buttons)
  - Active locale flag is visually highlighted; inactive is dimmed
  - Uses `next-intl`'s `useRouter().replace()` to switch locale on the same page
  - Locale preference is persisted via cookie automatically by `next-intl`
- [x] Add `LanguageSwitcher` to `Navbar.tsx` (right cluster next to cart, also in mobile menu)
- [x] Add `LanguageSwitcher` to `Footer.tsx` (bottom bar, next to tagline)

---

## Phase 10 — SEO: Metadata, Sitemap, hreflang

### 10a — Page metadata

- [x] Update `generateMetadata()` in every storefront page to use locale:
  - `title`, `description`, `openGraph.locale` all switch per locale
  - For dynamic pages (product, blog post): use the localized field
- [x] Update `src/app/[locale]/layout.tsx` metadata defaults (title template, siteName, description, OG locale per locale)

### 10b — Sitemap

- [x] `src/app/sitemap.ts` — generate entries for **both** locales with `alternates.languages`:
  ```ts
  {
    url: `https://example.com/he/shop`,
    alternates: {
      languages: {
        he: `https://example.com/he/shop`,
        en: `https://example.com/en/shop`,
      }
    }
  }
  ```
- [x] Include dynamic product and blog post URLs for both locales

### 10c — App manifest & robots

- [x] `src/app/manifest.ts` — scoped to `/admin`, Hebrew-only, no changes needed
- [x] `src/app/robots.ts` — no changes needed

---

## Phase 11 — Order Emails in Customer's Language

### 11a — Capture locale at checkout

- [x] `CheckoutForm.tsx` — sends `locale` in POST body via `useLocale()`
- [x] `src/app/api/checkout/route.ts` — validates and saves `locale` to `Order`

### 11b — Email templates

- [x] `src/lib/email.ts` — `sendOrderConfirmationEmail` accepts `locale` param (default "he")
- [x] English confirmation email: subject, greeting, body, delivery labels, receipt button, footer note
- [x] `emailShell` — locale-aware `lang`, `dir`, brand name, tagline
- [x] `summaryTable` — locale-aware labels (Subtotal/Shipping/Free/Total) + localized product names
- [x] `renderConfirmationHtml` — fully bilingual

### 11c — Test

- [ ] Place a test order on the Hebrew storefront → confirm Hebrew email
- [ ] Place a test order on the English storefront → confirm English email

---

## Completion Checklist

- [ ] `npx tsc --noEmit` — 0 TypeScript errors
- [ ] `npx next build` — builds successfully
- [ ] Storefront in Hebrew: all UI in Hebrew, RTL layout
- [ ] Storefront in English: all UI in English, LTR layout
- [ ] Switching language: URL changes, direction flips, no flash
- [ ] Product with no English content: falls back to Hebrew gracefully
- [ ] Admin: all UI in Hebrew, forms show bilingual fields
- [ ] All 5 legal pages render in both languages
- [ ] Order confirmation email matches storefront language
- [ ] Sitemap includes both locale variants for all pages

---

## Files Reference

### New files to create
```
src/i18n/routing.ts
src/i18n/request.ts
messages/he.json
messages/en.json
src/content/legal/privacy-he.md
src/content/legal/privacy-en.md
src/content/legal/terms-he.md
src/content/legal/terms-en.md
src/content/legal/returns-he.md
src/content/legal/returns-en.md
src/content/legal/shipping-he.md
src/content/legal/shipping-en.md
src/content/legal/accessibility-he.md
src/content/legal/accessibility-en.md
src/components/storefront/LanguageSwitcher.tsx
prisma/migrations/20260621_add_i18n_fields/migration.sql   ← already created
```

### Files to modify
```
next.config.ts
src/middleware.ts
src/app/layout.tsx                                           (simplified)
src/app/[locale]/layout.tsx                                  (new, replaces root locale handling)
src/app/[locale]/(storefront)/layout.tsx
src/app/[locale]/(storefront)/page.tsx
src/app/[locale]/(storefront)/about/page.tsx
src/app/[locale]/(storefront)/shop/page.tsx
src/app/[locale]/(storefront)/shop/[slug]/page.tsx
src/app/[locale]/(storefront)/blog/page.tsx
src/app/[locale]/(storefront)/blog/[slug]/page.tsx
src/app/[locale]/(storefront)/cart/page.tsx
src/app/[locale]/(storefront)/checkout/page.tsx
src/app/[locale]/(storefront)/checkout/success/page.tsx
src/app/[locale]/(storefront)/checkout/failed/page.tsx
src/app/[locale]/(storefront)/legal/privacy/page.tsx
src/app/[locale]/(storefront)/legal/terms/page.tsx
src/app/[locale]/(storefront)/legal/returns/page.tsx
src/app/[locale]/(storefront)/legal/shipping/page.tsx
src/app/[locale]/(storefront)/legal/accessibility/page.tsx
src/app/[locale]/not-found.tsx
src/app/[locale]/error.tsx
src/app/sitemap.ts
src/app/manifest.ts
src/components/storefront/Navbar.tsx
src/components/storefront/Footer.tsx
src/components/storefront/HeroBanner.tsx
src/components/storefront/CartDrawer.tsx
src/components/storefront/CheckoutForm.tsx
src/components/storefront/ProductCard.tsx
src/components/storefront/BlogCard.tsx
src/components/storefront/FeaturedProducts.tsx
src/components/storefront/Testimonials.tsx
src/components/storefront/CategoryStrip.tsx
src/components/storefront/ContactSection.tsx
src/components/a11y/AccessibilityWidget.tsx
src/components/admin/ProductForm.tsx
src/components/admin/BlogForm.tsx
src/components/admin/SiteContentEditor.tsx
src/lib/content.ts
src/lib/email.ts
src/lib/utils.ts                                             (add localize() helper)
src/types/index.ts
src/app/api/checkout/route.ts
src/app/api/admin/products/route.ts
src/app/api/admin/blog/route.ts
src/app/api/admin/blog/tags/route.ts
src/app/api/admin/site-content/route.ts
prisma/schema.prisma                                         ← already updated
```
