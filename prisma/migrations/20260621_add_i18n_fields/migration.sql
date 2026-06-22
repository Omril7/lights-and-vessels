-- Migration: Add i18n fields (Hebrew + English) to all translatable models
-- Strategy: RENAME existing columns to _he, then ADD nullable _en columns.
-- Using RENAME COLUMN preserves data and indexes without dropping rows.

-- ============================================================
-- Product
-- ============================================================
ALTER TABLE "Product" RENAME COLUMN "name"        TO "name_he";
ALTER TABLE "Product" RENAME COLUMN "description" TO "description_he";
ALTER TABLE "Product" RENAME COLUMN "tags"        TO "tags_he";

ALTER TABLE "Product" ADD COLUMN "name_en"        TEXT;
ALTER TABLE "Product" ADD COLUMN "description_en" TEXT;
ALTER TABLE "Product" ADD COLUMN "tags_en"        TEXT;

-- ============================================================
-- ProductImage
-- ============================================================
ALTER TABLE "ProductImage" RENAME COLUMN "alt" TO "alt_he";
ALTER TABLE "ProductImage" ADD COLUMN "alt_en" TEXT;

-- ============================================================
-- BlogPost
-- ============================================================
ALTER TABLE "BlogPost" RENAME COLUMN "title"   TO "title_he";
ALTER TABLE "BlogPost" RENAME COLUMN "excerpt" TO "excerpt_he";
ALTER TABLE "BlogPost" RENAME COLUMN "body"    TO "body_he";

ALTER TABLE "BlogPost" ADD COLUMN "title_en"   TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "excerpt_en" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "body_en"    TEXT;

-- ============================================================
-- BlogTag
-- ============================================================
-- name had a @unique constraint; the constraint moves with the rename.
ALTER TABLE "BlogTag" RENAME COLUMN "name" TO "name_he";
ALTER TABLE "BlogTag" ADD COLUMN "name_en" TEXT;

-- ============================================================
-- SiteContent
-- ============================================================
ALTER TABLE "SiteContent" RENAME COLUMN "value" TO "value_he";
ALTER TABLE "SiteContent" ADD COLUMN "value_en" TEXT;

-- ============================================================
-- SiteContentDraft
-- ============================================================
ALTER TABLE "SiteContentDraft" RENAME COLUMN "value" TO "value_he";
ALTER TABLE "SiteContentDraft" ADD COLUMN "value_en" TEXT;

-- ============================================================
-- Order — store the locale the customer used at checkout
-- ============================================================
ALTER TABLE "Order" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'he';
