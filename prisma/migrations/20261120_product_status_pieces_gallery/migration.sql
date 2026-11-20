-- Product status (replaces published + inStock), one-of-a-kind pieces,
-- category as a real relation, studio categories, and the gallery.

-- 1. Status enum + new product columns
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'COMING_SOON', 'SOLD', 'HIDDEN');

ALTER TABLE "Product"
  ADD COLUMN "status"      "ProductStatus" NOT NULL DEFAULT 'HIDDEN',
  ADD COLUMN "isUnique"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pieceNumber" INTEGER,
  ADD COLUMN "year"        INTEGER,
  ADD COLUMN "categoryId"  TEXT;

-- Carry the old flags over: unpublished -> HIDDEN, out of stock -> SOLD.
UPDATE "Product" SET "status" = CASE
  WHEN NOT "published" THEN 'HIDDEN'::"ProductStatus"
  WHEN NOT "inStock"   THEN 'SOLD'::"ProductStatus"
  ELSE 'AVAILABLE'::"ProductStatus"
END;

-- 2. Studio categories replace the jewellery template ones
INSERT INTO "ProductCategory" ("id", "slug", "name_he", "name_en", "order") VALUES
  ('cat_candles',   'candles',   'נרות',    'Candles',        0),
  ('cat_holders',   'holders',   'פמוטים',  'Candleholders',  1),
  ('cat_furniture', 'furniture', 'רהיטים',  'Furniture',      2),
  ('cat_prints',    'prints',    'הדפסים',  'Prints',         3)
ON CONFLICT ("slug") DO NOTHING;

-- Keep any category that isn't one of the template ones (admin-created).
UPDATE "Product" p SET "categoryId" = c."id"
FROM "ProductCategory" c
WHERE c."slug" = p."category"
  AND c."slug" NOT IN ('rings', 'necklaces', 'bracelets', 'earrings', 'home-decor');

-- Template-categorised products: assign by what they actually are.
UPDATE "Product" SET "categoryId" = (SELECT "id" FROM "ProductCategory" WHERE "slug" = 'holders')
WHERE "categoryId" IS NULL AND "name_he" LIKE '%פמוט%';
UPDATE "Product" SET "categoryId" = (SELECT "id" FROM "ProductCategory" WHERE "slug" = 'candles')
WHERE "categoryId" IS NULL AND "name_he" LIKE '%נר%';

DELETE FROM "ProductCategory"
WHERE "slug" IN ('rings', 'necklaces', 'bracelets', 'earrings', 'home-decor');

-- 3. The replaced columns ("category", "inStock", "published") stay for now so the
--    currently deployed code keeps working; a follow-up migration drops them after
--    the new code is live. They're no longer in schema.prisma.

CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Gallery
CREATE TABLE "GalleryProject" (
  "id"             TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "title_he"       TEXT NOT NULL,
  "title_en"       TEXT,
  "description_he" TEXT,
  "description_en" TEXT,
  "year"           INTEGER,
  "published"      BOOLEAN NOT NULL DEFAULT false,
  "sortOrder"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryProject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GalleryProject_slug_key" ON "GalleryProject"("slug");

CREATE TABLE "GalleryImage" (
  "id"        TEXT NOT NULL,
  "url"       TEXT NOT NULL,
  "alt_he"    TEXT,
  "alt_en"    TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "projectId" TEXT NOT NULL,
  CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GalleryImage_projectId_idx" ON "GalleryImage"("projectId");
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "GalleryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Pre-existing drift: index name didn't match the schema
ALTER INDEX "BlogTag_name_key" RENAME TO "BlogTag_name_he_key";
