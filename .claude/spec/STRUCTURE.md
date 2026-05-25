# Project Structure

```
/
├── prisma/
│   └── schema.prisma
├── public/               # Static assets only (logo, favicons). Product images live in Supabase Storage — see IMAGE_STORAGE.md.
├── src/
│   ├── app/
│   │   ├── (storefront)/  # Route group for public pages
│   │   │   ├── page.tsx              # Home
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx          # Shop / gallery grid
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Product detail
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # About the artist
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          # Cart page
│   │   │   └── layout.tsx            # Storefront layout (nav + footer)
│   │   ├── admin/          # Admin panel (protected)
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Add product
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit product
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Orders list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Order detail
│   │   │   ├── site-content/
│   │   │   │   └── page.tsx          # Edit hero text, about page, etc.
│   │   │   ├── documents/
│   │   │   │   └── page.tsx          # Morning documents archive (invoices, receipts, credit notes)
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Revenue / income reports from Morning
│   │   │   └── layout.tsx            # Admin layout (sidebar nav)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── products/
│   │   │   │   └── route.ts          # CRUD endpoints
│   │   │   ├── upload/
│   │   │   │   └── route.ts          # Image upload → Supabase Storage `products` bucket (admin-only)
│   │   │   ├── orders/
│   │   │   │   └── route.ts
│   │   │   ├── site-content/
│   │   │   │   └── route.ts
│   │   │   ├── checkout/
│   │   │   │   └── route.ts          # Create Morning hosted payment-form request
│   │   │   ├── webhooks/
│   │   │   │   └── morning/
│   │   │   │       └── route.ts      # Morning IPN — payment success → order + document
│   │   │   └── morning/               # Admin-only proxies to Morning's API
│   │   │       ├── documents/
│   │   │       │   └── route.ts      # List / fetch documents
│   │   │       ├── credit-notes/
│   │   │       │   └── route.ts      # Issue credit notes (refunds)
│   │   │       └── reports/
│   │   │           └── route.ts      # Income / revenue reports
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── storefront/               # Public UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx     # Image gallery with lightbox
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── CartDrawer.tsx         # Slide-out cart
│   │   │   └── AddToCartButton.tsx
│   │   ├── admin/                    # Admin UI components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ImageUploader.tsx      # Drag & drop multi-image upload
│   │   │   ├── OrdersTable.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   └── RichTextEditor.tsx     # For site content editing
│   │   └── ui/                       # Shared primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Badge.tsx
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── supabase-server.ts        # Supabase service-role client (server-only, for Storage uploads)
│   │   ├── morning.ts                # Morning (Green Invoice) API client + types
│   │   ├── cart.ts                   # Cart state (zustand or context)
│   │   └── utils.ts                  # Helpers (formatPrice, slugify, etc.)
│   └── types/
│       └── index.ts                  # Shared TypeScript types
├── .env.local                        # Environment variables
├── tailwind.config.ts
├── next.config.js
└── package.json
```
