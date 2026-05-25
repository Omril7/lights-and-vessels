# Image Storage

How product images move from the admin's machine → storage → the storefront.

---

## Today (local disk)

- `POST /api/upload` writes files to the project-root `uploads/` directory (gitignored).
- `GET /api/uploads/[file]` streams them back with `Content-Type` + immutable cache headers.
- `ProductImage.url` holds the path like `/api/uploads/abc123.webp`.

**Why this breaks in production on Vercel:** the filesystem is ephemeral. Each deploy gets a fresh container, and serverless functions can't write to disk at all. Uploaded images would either vanish on the next push or fail to save in the first place.

---

## Target (Supabase Storage, public bucket)

Pick: **Supabase Storage**.
- Already paying the "extra vendor" cost for the database — storage is free on the same project.
- 1 GB storage + 2 GB egress/month on the free tier. Comfortable headroom for a single artist's catalog.
- Public bucket = direct CDN-style URLs with no signed tokens. Perfect for a storefront where anyone can browse.
- One SDK (`@supabase/supabase-js`), one dashboard, one set of credentials.

Trade-off vs alternatives:
- **Vercel Blob** — slightly simpler if you're already on Vercel, but adds vendor + cost line.
- **Cloudflare R2** — cheaper at scale (no egress fees), but more setup; worth revisiting only if the catalog grows past a few GB or traffic spikes.
- **Cloudinary** — only worth it if you need on-the-fly transformations beyond what `next/image` already does. Overkill here.

---

## Execution plan

### 1. Create the bucket in Supabase

1. Supabase dashboard → **Storage** → **New bucket**.
2. Name: `products`.
3. **Public bucket: ON**. (Anyone can read; only the service-role key can write.)
4. File size limit: `10 MB` (matches the 8 MB cap on the API, leaves a margin).
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/avif`.

Bucket URLs will look like:
```
https://<project-ref>.supabase.co/storage/v1/object/public/products/<path>
```

### 2. Add env vars

In `.env.local` and prod (Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"           # safe to expose; client-side reads only
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"       # SERVER ONLY — never import into client code
SUPABASE_STORAGE_BUCKET="products"
```

Document these in `ENV.md` (dev) and `PRE_DEPLOY.md` (prod). The service-role key bypasses Row Level Security — treat it like a database password.

### 3. Install the SDK

```bash
npm install @supabase/supabase-js
```

### 4. Server-side Supabase client

Create `src/lib/supabase-server.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

This client must **only** be imported from server code (API routes, server actions, `getServerSideProps`). Never from `"use client"` files.

### 5. Rewrite `POST /api/upload`

Replace the disk-write logic with an upload to the bucket. Keep the existing auth check (admin session required), the 8 MB cap, and the MIME allowlist.

```ts
import { supabaseAdmin } from "@/lib/supabase-server";
import { randomUUID } from "crypto";

// inside the handler, after auth + validation:
const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;

const { error } = await supabaseAdmin.storage
  .from(process.env.SUPABASE_STORAGE_BUCKET!)
  .upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000, immutable",
    upsert: false,
  });

if (error) return Response.json({ error: error.message }, { status: 500 });

const { data } = supabaseAdmin.storage
  .from(process.env.SUPABASE_STORAGE_BUCKET!)
  .getPublicUrl(path);

return Response.json({ url: data.publicUrl });
```

Returned `url` is what `<ImageUploader>` already saves into `ProductImage.url` — no schema or UI changes needed.

### 6. Delete the old serve route

- Remove `src/app/api/uploads/[file]/route.ts` — Supabase serves the files now.
- Remove the `uploads/` directory and its entry in `.gitignore`.
- Update `STRUCTURE.md` to drop the `uploads/` and `api/uploads/` lines.

### 7. Allow Supabase in `next/image`

In `next.config.js`:

```js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "<project-ref>.supabase.co",
        pathname: "/storage/v1/object/public/products/**",
      },
    ],
  },
};
```

Without this, `<Image src={publicUrl} />` will throw at runtime.

### 8. Optional: delete on product-image removal

When the admin deletes a `ProductImage`, also delete the underlying object so the bucket doesn't fill up with orphans:

```ts
const path = url.split("/public/products/")[1];
await supabaseAdmin.storage
  .from(process.env.SUPABASE_STORAGE_BUCKET!)
  .remove([path]);
```

Skip this for v1 if you want — orphaned files are cheap and easy to clean up later with a one-off script.

---

## Migrating existing images

If there are real product images already in `uploads/`:

1. Write a one-off script `scripts/migrate-uploads-to-supabase.ts` that:
   - Reads every file in `uploads/`.
   - Uploads to the `products` bucket under the same filename.
   - Updates the matching `ProductImage.url` rows in the DB to the new public URL.
2. Run locally with prod `DATABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` exported.
3. Verify a few products on the storefront, then delete the local `uploads/` folder.

For a fresh launch with no real images, skip this and just re-upload through the admin.

---

## Verify

- Admin: upload an image → check it appears in Supabase dashboard under Storage → `products`.
- Storefront: open product page → image loads, `next/image` produces a `_next/image?url=…` optimized variant.
- Open the raw public URL in an incognito window → image loads without any auth.
- Network tab: 200, served with long `cache-control`.

---

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. If you ever see it referenced in a `"use client"` file or shipped to the browser, that's a leak — rotate it immediately in the Supabase dashboard.
- Public bucket means anyone with a URL can view that file. Never put receipts, customer documents, or anything order-related in `products`. Create a separate **private** bucket and use signed URLs for those.
- The admin's `/api/upload` route must keep its NextAuth check — without it, anyone could upload anything to your bucket.
