# Rebrand / Restyle Direction

Sources:
- Mood references and our own product shots in `~/.claude/projects/C--Users-omril-Projects-lights-and-vessels/images`
- Layout and typography principles from tkcreative.ca (structure only, see "Legal distance")

## The reading

**Moodboard (8 Pinterest references):**
- One object shot as a still life on a **single saturated backdrop**: moss green, cobalt, burnt orange, ochre, violet-blue.
- Hard light with real shadows, and film grain.
- Warm light glowing (flames, amber) against cool or deep backgrounds.
- Handmade materials: rust, wax, stone, wood, glaze.

**Our product (4 shots):** rusted-iron U-shaped candleholders on stone/terrazzo bases with feet, holding beeswax tapers, shot with flash on cobalt blue. These already speak the moodboard's language.

**Current site:**
- Beige palette (cream, linen, sand, clay).
- Rounded image corners, soft shadows, `rounded-organic` blob shapes.
- Dark gradient over the hero.
- Rounded "pill" buttons and small uppercase labels with wide letter spacing.

That's the generic "calm handmade boutique" look, and it dulls photos that are actually bold.

**TK Creative contributes the discipline:**
- Photos first.
- One serif font.
- No interface decoration.
- Lots of empty space.
- Quiet captions.

**The middle ground:** TK's restraint for the structure and typography, the moodboard's colour and light for the mood. The page stays quiet and the photos are loud.

## 1. Palette: backdrops replace beige

These hex values are rough estimates from the photos, to tune later.

| Role | Colour |
|---|---|
| Paper (page background) | off-white `#f2efe8` |
| Ink (text) | near-black `#1b1712` |
| Backdrop: cobalt | `#1d4f9c` (current product shoot) |
| Backdrop: moss | `#3d6a2c` |
| Backdrop: ember | `#c2561c` |
| Accent: beeswax / flame | `#d8b46a` |

- The page itself stays paper and ink; the backdrop colours come in through photos and full-colour sections.
- Each collection can own a backdrop (e.g. candleholders = cobalt, vessels = moss).

## 2. "Evening mode" (our own take on TK's colour dot)

- A small flame icon in the header switches the site to a dark, candlelit theme where product photos seem to glow.
- It plays on the name *Lights* & Vessels. Do **not** copy TK's gold dot or their three-colour cycle.

## 3. Typography

- Frank Ruhl Libre for nearly everything, at one or two weights. It supports Hebrew.
- Product names set apart by size/weight, **not italic**: Frank Ruhl Libre has no italic on Google Fonts (the browser would fake one), and Hebrew has no real italic tradition anyway.
- Drop the small uppercase labels with wide letter spacing.
- Assistant only for practical interface text: cart, checkout, forms, prices.

## 4. Remove the decoration

- Square image corners: no `rounded-xl` / `rounded-2xl` on images.
- No `shadow-soft` / `shadow-lift`.
- No `rounded-organic` blob shape.
- Buttons become underlined text, or square buttons in ink. No pills.
- Keep the grain texture (`paper-grain`) but tune it toward film grain, since it matches the photos.

## 5. Page by page

- **Home:**
  - Replace the full-screen hero with a split layout: a fixed text column on the right (RTL) holds a short statement, while a staggered column of product still lifes scrolls on the left.
  - Unlike TK, each photo has a caption and links to its product.
  - Backdrop colours alternate as you scroll.
- **Shop:**
  - Rows of three portrait photos with a small caption under each: italic name, then material and price.
  - **Hover lights the candle**: it swaps to a second photo of the same piece with the candles lit. Shoot every piece unlit and lit.
  - Remove the slide-up "add to cart" button.
- **Product page:**
  - The page takes the product's backdrop colour.
  - A large photo sits next to an expandable "+" list: materials, dimensions, care, shipping.
- **About:** one large opening paragraph about the work, then two short lists: materials and process.
- **Contact:** keep WhatsApp and the contact section, restyled to match.

## 6. Photography matters most

The look only works if every product is shot the way the candleholders were:
- one seamless coloured backdrop
- flash
- grain
- candles lit

The site design is a frame; the photos carry the brand.

## Legal distance

- **What we take from TK** is only general principles: restraint, one serif font, photos first, empty space. Those can't be owned.
- **What we never take from TK:**
  - their font (Sectra)
  - their grey `#f0f0f0` / gold `#b89b62` / charcoal `#232e2e` palette
  - the gold-tint image hover
  - the giant name pinned bottom-left over scrolling photos
  - the colour-dot theme switcher
  - any of their wording
- **The Pinterest photos** belong to other photographers. Use them only as mood references, never on the site.

## Order of work

1. Colours and type (`src/app/globals.css`, `tailwind.config.ts`), which restyles the whole site at once.
2. Remove the rounded corners, shadows and pill buttons across components.
3. Shop grid and `ProductCard` (with the lit-candle hover).
4. Product page.
5. Home layout.
6. Evening mode.
7. About page.
