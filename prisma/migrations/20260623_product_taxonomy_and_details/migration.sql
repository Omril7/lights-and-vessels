-- Product sort order, dimensions, materials; editable categories; shared bilingual tags.

ALTER TABLE "Product" ADD COLUMN "materials_he" TEXT;
ALTER TABLE "Product" ADD COLUMN "materials_en" TEXT;
ALTER TABLE "Product" ADD COLUMN "width"  DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "height" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "depth"  DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Initial order = newest first (matches the previous createdAt desc listing).
UPDATE "Product" p SET "sortOrder" = r.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) AS rn FROM "Product"
) r
WHERE p.id = r.id;

CREATE TABLE "ProductCategory" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name_he" TEXT NOT NULL,
  "name_en" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

INSERT INTO "ProductCategory" ("id", "slug", "name_he", "name_en", "order") VALUES
  ('cat_rings',     'rings',      'טבעות',   'Rings',     0),
  ('cat_necklaces', 'necklaces',  'שרשראות', 'Necklaces', 1),
  ('cat_bracelets', 'bracelets',  'צמידים',  'Bracelets', 2),
  ('cat_earrings',  'earrings',   'עגילים',  'Earrings',  3),
  ('cat_home',      'home-decor', 'לבית',    'Home',      4);

CREATE TABLE "ProductTag" (
  "id" TEXT NOT NULL,
  "name_he" TEXT NOT NULL,
  "name_en" TEXT,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductTag_name_he_key" ON "ProductTag"("name_he");
CREATE UNIQUE INDEX "ProductTag_slug_key" ON "ProductTag"("slug");

CREATE TABLE "ProductTagLink" (
  "productId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "ProductTagLink_pkey" PRIMARY KEY ("productId", "tagId")
);
CREATE INDEX "ProductTagLink_tagId_idx" ON "ProductTagLink"("tagId");
ALTER TABLE "ProductTagLink" ADD CONSTRAINT "ProductTagLink_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductTagLink" ADD CONSTRAINT "ProductTagLink_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry over legacy comma-separated tags. Hebrew and English entries are paired by position.
WITH he AS (
  SELECT p.id AS pid, btrim(t.v) AS name, t.n
  FROM "Product" p, unnest(string_to_array(coalesce(p."tags_he", ''), ',')) WITH ORDINALITY AS t(v, n)
  WHERE btrim(t.v) <> ''
), en AS (
  SELECT p.id AS pid, btrim(t.v) AS name, t.n
  FROM "Product" p, unnest(string_to_array(coalesce(p."tags_en", ''), ',')) WITH ORDINALITY AS t(v, n)
  WHERE btrim(t.v) <> ''
), paired AS (
  SELECT he.pid, he.name AS name_he, en.name AS name_en
  FROM he LEFT JOIN en ON en.pid = he.pid AND en.n = he.n
), distinct_tags AS (
  SELECT name_he, max(name_en) AS name_en FROM paired GROUP BY name_he
), inserted AS (
  INSERT INTO "ProductTag" ("id", "name_he", "name_en", "slug")
  SELECT 'tag_' || substr(md5(name_he), 1, 16), name_he, name_en, 'tag-' || substr(md5(name_he), 1, 12)
  FROM distinct_tags
  RETURNING "id", "name_he"
)
INSERT INTO "ProductTagLink" ("productId", "tagId")
SELECT DISTINCT paired.pid, inserted.id
FROM paired JOIN inserted ON inserted.name_he = paired.name_he;

ALTER TABLE "Product" DROP COLUMN "tags_he";
ALTER TABLE "Product" DROP COLUMN "tags_en";
