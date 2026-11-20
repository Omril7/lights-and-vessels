/**
 * One-off cleanup after migration 20261120_product_status_pieces_gallery.
 * Replaces the jewellery-template leftovers (slugs, English names) with real
 * product data and numbers the one-of-a-kind candleholders.
 *
 * Run once:  npx tsx scripts/cleanup-products-2026-11.ts
 * Safe to re-run: every update is keyed by product id and sets fixed values.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Fix = {
  id: string;
  slug: string;
  name_he: string;
  name_en: string;
  category: "candles" | "holders";
  isUnique?: boolean;
  pieceNumber?: number;
};

const FIXES: Fix[] = [
  // One-of-a-kind candleholders, numbered in the order they were made.
  { id: "cmpm56dxi000dm43u7vs0yokb", slug: "holder-01", name_he: "פמוט", name_en: "Candleholder", category: "holders", isUnique: true, pieceNumber: 1 },
  { id: "cmpm56eel000gm43u5btmrcle", slug: "holder-02", name_he: "פמוט", name_en: "Candleholder", category: "holders", isUnique: true, pieceNumber: 2 },
  { id: "cmpm56gaw000sm43ulr25wn8s", slug: "holder-03", name_he: "פמוט", name_en: "Candleholder", category: "holders", isUnique: true, pieceNumber: 3 },
  // Candles (sold in quantity, not numbered).
  { id: "cmpm56evo000jm43uzb5337oy", slug: "beeswax-candle-set", name_he: "מארז נרות שעוות דבורים", name_en: "Beeswax candle set", category: "candles" },
  { id: "cmpm56fcq000mm43uvk23m1e4", slug: "pair-of-candles-28-cm", name_he: "זוג נרות 28 ס״מ", name_en: "Pair of candles, 28 cm", category: "candles" },
  { id: "cmpm56ftt000pm43uil5y3bbo", slug: "raw-candle", name_he: "נר גולמי", name_en: "Raw candle", category: "candles" },
];

async function main() {
  const categories = await prisma.productCategory.findMany({
    where: { slug: { in: ["candles", "holders"] } },
  });
  const catId = new Map(categories.map((c) => [c.slug, c.id]));
  if (catId.size !== 2) throw new Error("Run the migration first — studio categories are missing.");

  for (const f of FIXES) {
    const exists = await prisma.product.findUnique({ where: { id: f.id } });
    if (!exists) {
      console.log(`skip ${f.id} (not found)`);
      continue;
    }
    await prisma.product.update({
      where: { id: f.id },
      data: {
        slug: f.slug,
        name_he: f.name_he,
        name_en: f.name_en,
        categoryId: catId.get(f.category)!,
        isUnique: f.isUnique ?? false,
        pieceNumber: f.pieceNumber ?? null,
        year: exists.year ?? 2026,
        ...(f.isUnique ? { stockCount: Math.min(exists.stockCount, 1) } : {}),
      },
    });
    console.log(`ok   ${f.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
