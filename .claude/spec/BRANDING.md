# Branding, Design, Localization & Responsiveness

## Branding Assets

- Logo files are in `public/`: `logo-2169x1282-black.png` (for light backgrounds), `logo-2169x1282-white.png` (for dark backgrounds / footer). Wide aspect ratio — use the black version in the Navbar and the white version in the Footer; size with CSS so the rendered logo fits visually (target ~32–40px tall in the navbar).
- Favicon / apple-touch-icon / OG image — **still owed by the artist** (or generate from the logo with the artist's approval).
- Color palette — earthy default in spec until the artist signs off on a final palette.

---

## Design Philosophy

This is an artist's site — the design IS the brand. Follow these principles:

- **Gallery-first**: Products are art pieces, not items in a grid. Think editorial layouts, generous whitespace, large imagery.
- **Handcrafted feel**: Avoid corporate/template aesthetics. Use organic shapes, subtle textures (paper grain, linen, watercolor washes), and imperfect details that echo handmade craft.
- **Typography**: The site is in Hebrew, so fonts MUST support Hebrew glyphs. Use a distinctive Hebrew serif/display font for headings (e.g., `Frank Ruhl Libre`, `David Libre`) paired with an elegant Hebrew sans-serif for body (`Assistant`, `Heebo`, `Rubik`). Import via Google Fonts. Never use Arial or generic system fonts.
- **Color palette**: Warm, earthy tones — think clay, sand, terracotta, olive, charcoal. One accent color for CTAs (a muted gold or copper). Define all colors as CSS variables / Tailwind theme extensions.
- **Motion**: Subtle scroll-triggered fade-ins, image hover zoom, smooth page transitions. **Rule: all animations MUST use the [`motion`](https://motion.dev) library (the successor to Framer Motion — package name `motion`, imported as `motion/react`).** Do not use Framer Motion, CSS-only keyframe animations for anything beyond trivial hover/focus transitions, GSAP, or other animation libraries. Nothing flashy — graceful and intentional. Respect the accessibility widget's "reduce motion" setting and the OS `prefers-reduced-motion` — wrap animations so they collapse to no-op when reduced motion is active.
- **Photography-centric**: Full-bleed hero images, product images that breathe. Support multiple images per product with a lightbox/gallery viewer.
- **Mobile-first**: Must look stunning on phones. Jewelry buyers browse on mobile.

---

## Language & Localization

**The entire site is in Hebrew (he-IL) with a right-to-left (RTL) layout.**

- Set `<html lang="he" dir="rtl">` on the root layout. The whole document flows RTL.
- **All user-facing text** — storefront copy, navigation, buttons, labels, admin panel, form fields, validation messages, empty states, toasts — is written in Hebrew.
- Use Tailwind logical properties (`ps-*`/`pe-*`, `ms-*`/`me-*`, `start-*`/`end-*`, `text-start`/`text-end`) instead of physical left/right so layouts mirror correctly. Where physical directions are unavoidable, account for RTL.
- Icons and directional UI (carousels, back arrows, breadcrumbs, drawer slide direction) must mirror for RTL — e.g. the cart drawer slides in from the **left**, "next" arrows point left.
- **Numbers, prices, and dates**: prices shown with the ₪ (ILS / new shekel) symbol. Use `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`. Dates formatted with the `he-IL` locale.
- Seed data (product names, descriptions, categories, site content) is written in natural, idiomatic Hebrew — not machine-translated.
- Category slugs and DB keys stay in English (ASCII) for URLs and code; only their **display labels** are Hebrew.
- Fonts must render Hebrew well (see Typography above).

---

## Responsive Design

**Every page must be fully responsive and look polished on all device sizes** — not just "mobile-first" as a slogan, but verified across the full range.

- **Target breakpoints**: small phones (~320–375px), large phones (~390–430px), tablets (~768px), laptops (~1024–1280px), and wide desktops (1440px+). Nothing may overflow, clip, or overlap at any width.
- **Mobile-first build order**: style the base (smallest) layout first, then layer `sm: md: lg: xl:` enhancements. Never hard-code desktop-only layouts.
- **Fluid layouts**: use responsive grids that reflow (e.g. 2 columns on phone → 4 on desktop), `flex-wrap`, and fluid type. Avoid fixed pixel widths that can overflow narrow viewports.
- **Touch targets**: interactive elements at least 44×44px on touch devices; adequate spacing so taps don't collide.
- **No horizontal scroll** at any breakpoint (except intentional carousels/thumbnail strips).
- **Images**: always use `next/image` with correct `sizes` so each viewport downloads an appropriately scaled image.
- **Navigation**: hamburger/drawer menu on mobile, full nav on desktop. The cart drawer is full-width on phones, fixed-width on larger screens.
- **RTL + responsive together**: mirrored layouts must hold up at every breakpoint.
- **Verify** the storefront and admin panel on a 320–375px viewport before considering any page done.
