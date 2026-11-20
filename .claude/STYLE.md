# Style Direction

Source of truth: the design board "Orot Vekelim — homepage mockup"
(https://claude.ai/artifact/QZv57suvEcJHJTWxG6bsLx), page **"For Omri"**:
- **Entry**: the homepage
- **Store**
- **Product (B1)**

The other boards on that canvas are explorations only.

Earlier reference work (tkcreative.ca, the Pinterest moodboard) shaped the principles below. The cobalt-first palette from that round is superseded; cobalt survives as one of the three themes.

## Palette (default "paper" theme)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#efe7d8` | page background |
| `--paper-2` | `#e4d9c5` | section tint |
| `--stone` | `#cdbfa8` | hairlines, image placeholders |
| `--stone-2` | `#a89c86` | dimmed text on dark |
| `--ink` | `#1c1612` | text, dark sections |
| `--ink-2` | `#3a2e26` | secondary text |
| `--accent` | `#a3361f` | links, active nav, hover |
| `--stamp` | `#c2271d` | ink-stamp buttons on the product page |

Legacy class names (`cream`, `linen`, `sand`, `charcoal`, `copper`…) are aliases of these tokens. New code should use the new names.

## Themes

There are three storefront colour themes, switched by `ThemeSwitcher` in the header and set as `html[data-theme]` before paint:
- **נייר / Paper**: the default, above.
- **ערב / Evening**: dark brown `#1c1612` with cream text `#e6ddbf` and a warm red accent.
- **כחול / Cobalt**: `#1e4a8e`, the product-photo backdrop, with cream text and a beeswax accent.

**The theme button** (`ThemeSwitcher`, in the header next to the language link):
- It's a three-state button: each click moves to the next theme, נייר → ערב → כחול → back to נייר.
- It shows a small **square** swatch of the theme a click will switch to, with no text label.
- Its accessible label names the current and next theme ("ערכת צבעים: נייר. לחיצה מעבירה לערב").
- The choice is saved in `localStorage` (`lv-theme`) and applied before paint by the boot script in `app/layout.tsx`.

Themes are scoped to `.storefront`, so the admin keeps the default palette. The accessibility colour modes always win over a theme.

## Type

- **Heebo** (`font-sans`, weights 300–700) for text, navigation and UI. Light weight (300) for secondary text.
- **Frank Ruhl Libre** (`font-serif`, weights 300–700) for headings and statements.
- No italics: Frank Ruhl has none, and Hebrew has no real italic tradition.
- No uppercase or wide letter spacing in Hebrew. The design uses wide-spaced English caps only for the small "Orot Vekelim · Design studio" line.

## Shape and texture

- Square everything: no rounded corners on images, cards or buttons. Circles only for icon buttons, dots and avatars.
- No shadows, except on floating layers (drawer, menus, modals, WhatsApp button).
- Thin 1px hairlines (`stone`) separate captions from images and rows from each other.
- Film grain on paper sections (`.paper-grain`).
- Ink-stamp buttons on the product page: a 2px `stamp` border plus `.ink`, which applies the `#ink-edge` SVG displacement filter defined in `app/layout.tsx`.
- Photos are slightly desaturated (`saturate(0.85)`); dark hero photos are dimmed so text reads over them.

## Products

- Status is `AVAILABLE`, `COMING_SOON`, `SOLD` or `HIDDEN`; see `lib/product-status.ts`.
  - The store lists AVAILABLE and COMING_SOON. Coming-soon items show "בקרוב" in place of the price.
  - SOLD pieces leave the store and appear in the Gallery; their product page stays reachable.
- **One-of-a-kind pieces** (`isUnique`) are numbered and shown as "<name> 03" via `displayName()`. Only unique pieces get numbers. A unique piece flips to SOLD automatically when paid.

## Pages (target)

- **Entry (`/`)**: a full-screen dark photo with the logo and one line, plus three large links: החנות / הגלריה / אודות. Hovering a link swaps the background photo to that section's image and dims the other links.
- **Store (`/shop`)**: a sticky cream header, a photo banner with "החנות", square category filter buttons, and a grid of 4:5 photos. Each caption has a hairline, then name and price, then a one-line spec.
- **Product (`/shop/[slug]`)**:
  - A centred square photo with thumbnails.
  - A large serif name, then a tiny spec line (one of a kind · materials · dimensions · year).
  - An ink-stamp buy button, plus "back to store" and "ask about this piece" stamps.
- **Gallery (`/gallery`)**: sold pieces plus `GalleryProject` entries.
- **Blog**: kept, linked from the footer only.

## Routing

Hebrew is the default and has no prefix (`/shop`); English lives at `/en/shop`. `lib/seo.ts` builds paths and hreflang links.

## Legal distance (TK Creative)

We never take TK Creative's:
- font (Sectra)
- grey `#f0f0f0` / gold `#b89b62` / charcoal `#232e2e` palette
- gold-tint image hover
- giant name pinned bottom-left over scrolling photos
- single gold dot as the colour cycler. Ours also cycles, but keep it a small square swatch of the next theme in our own palette, never a round gold dot.
- wording

The Pinterest photos are mood references only, never site content.
