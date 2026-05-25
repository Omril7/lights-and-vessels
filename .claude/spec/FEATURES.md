# Feature Specifications

## Shipping

Two delivery options at checkout — no courier integration, no parcel-locker integration.

1. **דואר ישראל (Israel Post)** — flat-rate domestic shipping. Price is a single fixed number set in `SiteContent` (key: `shipping_post_price`, default placeholder until artist decides — likely ₪25–₪35). Delivery window shown to the customer: "עד 7 ימי עסקים" (placeholder, confirm with artist).
2. **איסוף עצמי (self pickup)** — free. Pickup address shown after order is confirmed; the artist coordinates pickup time via WhatsApp using the contact details on the order.

Open shipping questions for the artist (track these — they block launch but not Phase 3 build):
- Exact shipping price for דואר ישראל.
- Free-shipping threshold (e.g. `free over ₪250`) — if yes, set `shipping_free_over` in SiteContent; if no, leave blank.
- Processing time before dispatch (1–3 days?).
- Pickup address + preferred hours (will appear in the order-confirmation email and on `/checkout/success`).

`SiteContent` keys to add: `shipping_post_price`, `shipping_post_eta`, `shipping_free_over`, `shipping_pickup_address`, `shipping_pickup_hours`, `shipping_processing_days`.

Checkout shows both methods as a radio group; the chosen method is stored on `Order.shippingMethod` (`"post"` | `"pickup"`) and the chosen price feeds `Order.shippingCost`. Pickup orders skip the address-form fields (only name, email, phone required).

---

## Legal Pages

The artist has **no existing** legal documents. All four must be drafted before launch:

1. **תקנון האתר (Terms of Service)**
2. **מדיניות פרטיות (Privacy Policy)** — must cover Google OAuth login, cookies, Morning payment processing, Resend email.
3. **מדיניות החזרות / ביטולים (Returns & Cancellations)** — must comply with חוק הגנת הצרכן (14-day cooling-off for distance sales, exceptions for custom/handmade items — verify with the artist what he wants to commit to).
4. **מדיניות משלוחים (Shipping Policy)** — derived from the Shipping section above once values are filled in.
5. **הצהרת נגישות (Accessibility Statement)** — partial today; complete it once the widget is finalized and the artist provides the accessibility-coordinator contact (per תקן 5568).

Each gets a route under `/legal/<slug>` rendered from `SiteContent` (markdown), linked from the footer. Draft text will be written collaboratively with the artist — do not ship placeholder lorem-ipsum.

---

## Accessibility Widget

The site includes a **floating accessibility button** (present on every page — storefront and admin), in the spirit of Israeli accessibility law (IS 5568 / תקן 5568). Clicking it opens a panel of accessibility adjustments the visitor can toggle. All choices **persist** (localStorage) and apply across the whole site without a flash on reload.

**Widget behaviour**
- A round floating button fixed to a screen corner, with the universal accessibility symbol and a Hebrew `aria-label`.
- Opens a panel (Hebrew labelled, RTL) with the options below. Fully keyboard operable — focusable controls, `Escape` closes, visible focus rings, proper ARIA roles.
- A "reset" action returns all settings to default.

**Adjustments offered**
- **Font size** — step the base font size up/down (several levels). Whole site scales via root `rem`.
- **High contrast** — a strong black/white/yellow palette (implemented by overriding the theme CSS variables, so layout/overlays are unaffected).
- **Grayscale** — desaturate the palette and images.
- **Highlight links** — make every link visually distinct (underline + outline).
- **Readable font** — switch display/serif fonts to a plain, legible sans-serif.
- **Large cursor** — an enlarged pointer.
- **Reduce motion** — disable animations, transitions, and scroll-triggered effects.

**Implementation notes**
- Settings are applied as classes on `<html>`; an inline head script applies saved settings before first paint to avoid flicker.
- Do **not** apply CSS `filter` to an ancestor of fixed/sticky elements (it breaks `position: fixed`) — use CSS-variable overrides for contrast/grayscale and filter only individual `<img>` elements.
- Honors the OS `prefers-reduced-motion` setting as a default.

---

## Contact & WhatsApp

The artist is a one-person studio — direct contact matters.

- **Floating WhatsApp button**: a fixed floating button (opposite corner from the accessibility widget) that opens a WhatsApp chat (`https://wa.me/<number>?text=<prefilled>`). Present on every page. The number and prefilled message come from `SiteContent` so the artist can edit them in the admin panel.
- **Contact section**: a "צרו קשר" section on the About page with the WhatsApp link, an email address, and a short warm invitation to get in touch (custom orders, questions). Copy and contact details come from `SiteContent`.
- New `SiteContent` keys: `whatsapp_number`, `whatsapp_message`, `contact_email`, `contact_heading`, `contact_text`.

---

## Storefront Pages

### Home Page
- **Hero section**: Full-width image/video with overlaid text (title + subtitle from SiteContent). CTA button → Shop page.
- **Featured products**: Horizontal scroll or asymmetric grid of products where `featured = true`. Each card shows image, name, price with hover effect.
- **Artist story teaser**: Short paragraph from SiteContent + a "Read more" link to About page. Include a lifestyle/studio photo.
- **Categories strip**: Visual category cards (Rings, Necklaces, etc.) linking to filtered shop view.
- **Instagram/social proof section** (optional): Grid of lifestyle images or testimonials.

### Shop Page
- **Gallery grid**: Responsive masonry or CSS grid. Products show main image, name, price. Hover reveals second image (if available) + quick "Add to Cart."
- **Filters**: By category (sidebar or top bar). Sort by: newest, price low→high, price high→low. **Category filter UI is hidden when every product has a null category** (launch state) — appears automatically once the artist assigns at least one category. The "category strip" on Home is hidden under the same condition.
- **Empty state**: Graceful message if no products match filter.
- **Pagination or infinite scroll**.

### Product Detail Page (`/shop/[slug]`)
- **Image gallery**: Main image + thumbnails. Click to open lightbox with zoom. Swipeable on mobile.
- **Product info**: Name, price (with compare-at price struck through if on sale), full description (rendered markdown), category badge, stock status.
- **"Add to Cart" button** with quantity selector.
- **Related products** section at bottom.

### About Page
- **Rich text content** from SiteContent. Support images inline.
- **Artist portrait**.
- **Process/workshop photos** (optional gallery).

### Cart Page
- List of cart items with image thumbnail, name, price, quantity adjuster, remove button.
- Subtotal, shipping estimate, total.
- "Proceed to Checkout" → creates a **Morning hosted payment-form** request and redirects the customer to it.
- Cart state managed client-side (zustand store with localStorage persistence).

### Cart Drawer
- Slide-out drawer accessible from any page via cart icon in navbar.
- Shows item count badge on cart icon.
- Mini version of cart with "View Cart" and "Checkout" buttons.

---

## Admin Panel

Protected by NextAuth.js. Only users with `role: "admin"` can access `/admin/*`.

### Admin Login
- Simple email/password login page at `/admin/login`.
- On first run, seed a default admin user (credentials from env vars).

### Dashboard (`/admin`)
- **Stats cards**: Total products, total orders, revenue this month, pending orders.
- **Recent orders** table (last 10).
- **Quick actions**: Add product, view orders.

### Products Management (`/admin/products`)
- **Products table**: Thumbnail, name, category, price, stock, published status, actions (edit/delete).
- **Search & filter** by name, category, status.
- **Bulk actions**: Publish/unpublish, delete selected.

### Add/Edit Product (`/admin/products/new`, `/admin/products/[id]/edit`)
- **Product form** with fields:
  - Name (auto-generates slug, editable)
  - Description (rich text editor — use a simple markdown editor like `react-simplemde-editor` or a basic toolbar)
  - Price + compare-at price
  - Category (dropdown)
  - Tags (comma input or tag chips)
  - Stock count
  - Featured toggle
  - Published toggle
- **Image uploader**:
  - Drag & drop zone + file picker.
  - Multi-image upload.
  - Reorder images via drag & drop.
  - Delete individual images.
  - Images saved to `/public/uploads/` with unique filenames.
  - Show upload progress.

### Orders Management (`/admin/orders`)
- **Orders table**: Order number, date, customer name, total, status badge, actions.
- **Filter by status**: All, Pending, Confirmed, Shipped, Delivered, Cancelled.
- **Order detail view**: Full order info, items list, customer details, shipping address, status update dropdown, admin notes field.

### Site Content Editor (`/admin/site-content`)
- **Editable content blocks**: Hero title, hero subtitle, hero image URL, about page content, footer text, etc.
- Each block shows current value in an editable field.
- Save updates per block or all at once.
- Changes reflect immediately on the storefront.
- **Announcement banner group**: `banner_enabled` (boolean toggle, stored as `"true"`/`"false"`), `banner_text` (short message — e.g. `"משלוח חינם בהזמנות מעל ₪250"`), `banner_link` (optional URL the banner links to; empty = non-clickable). Render this group with a dedicated UI: a toggle switch, a single-line text input, and a URL input. The dismiss state is per-text in `localStorage`, so editing `banner_text` re-shows the banner for everyone who previously dismissed it.
