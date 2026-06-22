-- Missing from 20260621: rename BlogPostImage.alt to alt_he and add alt_en
ALTER TABLE "BlogPostImage" RENAME COLUMN "alt" TO "alt_he";
ALTER TABLE "BlogPostImage" ADD COLUMN "alt_en" TEXT;
