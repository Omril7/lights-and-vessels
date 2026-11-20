-- Follow-up to 20261120_product_status_pieces_gallery: the deployed code now
-- uses status / categoryId, so the replaced columns can go.
ALTER TABLE "Product"
  DROP COLUMN IF EXISTS "category",
  DROP COLUMN IF EXISTS "inStock",
  DROP COLUMN IF EXISTS "published";
