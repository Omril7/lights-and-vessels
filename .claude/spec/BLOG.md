# Blog feature

Storefront blog with admin-managed posts and tags. Posts are written in Markdown, listed at `/blog`, viewable individually at `/blog/[slug]`, filterable by tag.

## Decisions

- **Body**: Markdown. Render with `react-markdown` + `remark-gfm` (tables, lists, links). Images embedded inline via standard markdown `![alt](url)`.
- **Tags**: predefined, admin-managed (separate table). Each post links to many tags. Admin can add/rename/delete tags. Hebrew tag names like `רהיטים`, `הדפסים`, `השראות`.
- **Author**: plain text field on the post, defaults to `אלון בראל`. Admin can override per post.
- **Images**: Cover image required. Uses the existing `/api/upload` route with a new `blog` folder (same Supabase bucket). Inline body images use the same uploader.
- **Status**: `draft` / `published`. Only `published` posts (with `publishedAt <= now`) appear on the storefront.
- **SEO**: each post page sets `<title>`, meta description (from excerpt), OG image (cover), canonical URL.
- **Listing**: `/blog` shows cards one-by-one (vertical stack on mobile, grid on desktop) ordered by `publishedAt` desc. Tag chips at the top toggle a filter (`?tag=slug`).

## Schema (Prisma)

```prisma
model BlogPost {
  id           String      @id @default(cuid())
  title        String
  slug         String      @unique
  excerpt      String
  body         String      // markdown
  coverImage   String
  coverAlt     String?
  author       String      @default("אלון בראל")
  status       String      @default("draft") // draft | published
  publishedAt  DateTime?
  tags         BlogPostTag[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([status, publishedAt])
}

model BlogTag {
  id        String        @id @default(cuid())
  name      String        @unique   // Hebrew, e.g. רהיטים
  slug      String        @unique   // ascii slug for URLs
  order     Int           @default(0)
  posts     BlogPostTag[]
  createdAt DateTime      @default(now())
}

model BlogPostTag {
  post   BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    BlogTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String
  @@id([postId, tagId])
}
```

## Routes

### Storefront
- `GET /blog` — server component. Reads published posts (optionally `?tag=<slug>`), renders header + tag filter chips + card list. Empty state if none.
- `GET /blog/[slug]` — server component. Renders cover, title, author + date, tags, markdown body. `generateMetadata` for SEO. 404 if not published.

### Admin
- `/admin/blog` — list posts (title, status, date, tags). New post button.
- `/admin/blog/new` — form: title, slug (auto), excerpt, cover image upload, body (textarea, markdown), tag multi-select, author (defaults `אלון בראל`), status, publishedAt.
- `/admin/blog/[id]/edit` — same form, populated.
- `/admin/blog/tags` — manage tags (name, slug, order, delete).

### API (admin)
- `POST /api/admin/blog` — create
- `PATCH /api/admin/blog/[id]` — update
- `DELETE /api/admin/blog/[id]` — delete
- `POST /api/admin/blog/tags` — create tag
- `PATCH /api/admin/blog/tags/[id]` — rename/reorder
- `DELETE /api/admin/blog/tags/[id]` — delete

Upload route: reuse `/api/upload` with `folder=blog` (extend the allowed-folder check).

## Components

- `src/components/storefront/BlogCard.tsx` — image + title + excerpt + tags + date + author.
- `src/components/storefront/BlogTagFilter.tsx` — clickable chips; client component using `useSearchParams`.
- `src/components/storefront/Markdown.tsx` — wraps `react-markdown` with a safe component map + tailwind typography. Used on post detail page.
- `src/components/admin/BlogForm.tsx` — shared create/edit form. Tag picker uses the `Dropdown` component (project convention).

## Navbar

Add a "בלוג" link to the storefront Navbar.

## Implementation order

1. Prisma migration: `BlogPost`, `BlogTag`, `BlogPostTag`.
2. Extend `/api/upload` to accept `folder=blog`.
3. Admin pages: tag manager → post list → post form.
4. Storefront: `/blog` list + tag filter, `/blog/[slug]` detail with markdown renderer.
5. Navbar link.
6. Seed starter tags (`רהיטים`, `הדפסים`, `השראות`).

## Dependencies to add

- `react-markdown`
- `remark-gfm`
- `@tailwindcss/typography` (only if not already present)
