import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/1100`;

type SeedProduct = {
  name_he: string;
  slug: string;
  description_he: string;
  price: number;
  comparePrice?: number;
  category: string;
  tags_he: string;
  stockCount: number;
  featured: boolean;
  published: boolean;
  images: string[];
};

/** Product copy is written in idiomatic Hebrew. Slugs stay ASCII for URLs. */
const products: SeedProduct[] = [
  {
    name_he: "טבעת חותם בריכת גאות",
    slug: "tidepool-signet-ring",
    description_he:
      "יצוקה ממקור שעווה מגולף ביד, **טבעת בריכת הגאות** נושאת בריכה של אמייל בגוון טורקיז עמוק, משובצת בכסף סטרלינג ממוחזר.\n\nכל טבעת מוגמרת בעבודת יד, ולכן אין שתי טבעות שתופסות את האור באותו אופן בדיוק. פריט שקט, שנועד לשימוש יומיומי.\n\n## פרטים\n- כסף סטרלינג ממוחזר\n- אמייל יצוק ביד\n- מיוצרת לפי הזמנה תוך שבוע-שבועיים",
    price: 620,
    category: "rings",
    tags_he: "כסף, אמייל, סטייטמנט",
    stockCount: 6,
    featured: true,
    published: true,
    images: ["ring-tide-1", "ring-tide-2"],
  },
  {
    name_he: "טבעת הקשה דקה",
    slug: "hammered-stacking-band",
    description_he:
      "טבעת דקה עם משטח מוקש בעדינות שמפזר את האור כמו מים. תוכננה כדי להילבש לבד או בערימה של שלוש-ארבע יחד.\n\nהמרקם מורם יחידה אחר יחידה בעזרת פטיש צורפים — גימור כן, של עבודת יד.",
    price: 240,
    comparePrice: 310,
    category: "rings",
    tags_he: "כסף, מינימלי, לערימה",
    stockCount: 22,
    featured: false,
    published: true,
    images: ["ring-band-1", "ring-band-2"],
  },
  {
    name_he: "תליון ענף זית",
    slug: "olive-branch-pendant",
    description_he:
      "זרד זית מוטבע בברונזה, ומושחל על שרשרת כסף מחומצנת באורך 45 ס\"מ. מחווה קטנה לאחר צהריים ים-תיכוניים ואיטיים.\n\nהעלים יצוקים מענף אמיתי שנקטף מגינת הסטודיו.",
    price: 460,
    category: "necklaces",
    tags_he: "ברונזה, בוטני, יומיומי",
    stockCount: 9,
    featured: true,
    published: true,
    images: ["neck-olive-1", "neck-olive-2"],
  },
  {
    name_he: "שרשרת אבן נהר",
    slug: "riverstone-drop-necklace",
    description_he:
      "אבן ג'ספר מלוטשת אחת, עטופה במסגרת כסף עדינה ותלויה על שרשרת חוליות דקה. אדמתי, מקרקע, ונועז בשקט.\n\nמכיוון שכל אבן היא טבעית, הגוון והעורקים של הפריט שלך יהיו ייחודיים לחלוטין.",
    price: 530,
    category: "necklaces",
    tags_he: "ג'ספר, אבן, ייחודי",
    stockCount: 0,
    featured: false,
    published: true,
    images: ["neck-river-1", "neck-river-2"],
  },
  {
    name_he: "עגילי דיסקית חרס",
    slug: "clay-disc-earrings",
    description_he:
      "דיסקיות קלות מחרס אבן מגולגל ביד, מזוגגות בגוון טרקוטה חמים ומוגמרות בווי אוזן מצופי זהב.\n\nקלילים כנוצה ומיועדים לשימוש לאורך כל היום.",
    price: 180,
    category: "earrings",
    tags_he: "קרמיקה, טרקוטה, קליל",
    stockCount: 18,
    featured: true,
    published: true,
    images: ["ear-clay-1", "ear-clay-2"],
  },
  {
    name_he: "עגילי סהר נמשכים",
    slug: "crescent-thread-earrings",
    description_he:
      "עגילי סהר דקיקים מצופי זהב מוקשים, שמשרטטים את קימור האוזן. מודרניים, חסרי משקל וקלים מאוד ללבישה.",
    price: 270,
    comparePrice: 340,
    category: "earrings",
    tags_he: "מצופה זהב, נמשך, מודרני",
    stockCount: 14,
    featured: false,
    published: true,
    images: ["ear-crescent-1", "ear-crescent-2"],
  },
  {
    name_he: "צמיד עור קלוע",
    slug: "woven-leather-cuff",
    description_he:
      "עור מעובד בעיבוד צמחי, קלוע ביד סביב שלד פליז, עם וו סגירה מחושל. העור מתרכך ומעמיק בגוונו ככל שלובשים אותו.",
    price: 360,
    category: "bracelets",
    tags_he: "עור, פליז, יוניסקס",
    stockCount: 11,
    featured: false,
    published: true,
    images: ["brace-cuff-1", "brace-cuff-2"],
  },
  {
    name_he: "צמיד שרשרת קשרים",
    slug: "knotted-silver-chain-bracelet",
    description_he:
      "שרשרת חוליות מסיבית שנקטעת בשלושה קשרי כסף קשורים ביד — חידה קטנה של צמיד שמרגישה נפלא בכף היד.",
    price: 590,
    category: "bracelets",
    tags_he: "כסף, שרשרת, סטייטמנט",
    stockCount: 5,
    featured: true,
    published: true,
    images: ["brace-knot-1", "brace-knot-2"],
  },
  {
    name_he: "אגרטל קרמיקה אדווה",
    slug: "ripple-ceramic-bud-vase",
    description_he:
      "אגרטל פריחה מחרס אבן, מעוצב על אובניים, עם שפה מתאדוות וזיגוג מנוקד בגוון שיבולת שועל. בדיוק בגודל הנכון לגבעול בודד או לזרד של עשב מיובש.",
    price: 195,
    category: "home-decor",
    tags_he: "קרמיקה, אגרטל, סטודיו",
    stockCount: 16,
    featured: false,
    published: true,
    images: ["home-vase-1", "home-vase-2"],
  },
  {
    name_he: "נר שעוות דבורים יצוק ביד",
    slug: "hand-poured-beeswax-candle",
    description_he:
      "שעוות דבורים טהורה יצוקה לתוך כלי חרס רב-פעמי, מבושמת קלות מהשעווה עצמה — דבש, חמימות, שום דבר סינתטי. זמן בעירה של כ-40 שעות.",
    price: 135,
    comparePrice: 165,
    category: "home-decor",
    tags_he: "נר, שעוות דבורים, מתנה",
    stockCount: 27,
    featured: false,
    published: true,
    images: ["home-candle-1", "home-candle-2"],
  },
];

const siteContent: { key: string; value_he: string; type: string }[] = [
  { key: "hero_title", value_he: "חפצים שנוצרים לאט, ביד", type: "text" },
  {
    key: "hero_subtitle",
    value_he:
      "אוסף סטודיו קטן של תכשיטים וחפצים לבית — יצוקים, מעוצבים על אובניים ומוגמרים פריט אחר פריט.",
    type: "text",
  },
  { key: "hero_image", value_he: img("hero-studio"), type: "image" },
  { key: "hero_cta", value_he: "לגלות את האוסף", type: "text" },
  {
    key: "story_teaser",
    value_he:
      "הכול כאן מתחיל על שולחן עץ בלוי לצד חלון הפונה צפונה. אני עובד במנות קטנות, בידיים, בלי שום חיפזון — ומניח לכל חומר לרמוז למה שהוא רוצה להפוך.",
    type: "richtext",
  },
  { key: "story_image", value_he: img("studio-bench"), type: "image" },
  {
    key: "about_text",
    value_he:
      "## סטודיו של אדם אחד\n\nאני יוצר שעובד מסטודיו מואר בקצה העיר. כבר יותר מעשור אני מעצב מתכת, חרס ועור לחפצים קטנים שנועדו לחיות לצדנו — להישחק לחלקות, לעבור הלאה, להישמר.\n\nאני מאמין ב**יצירה איטית**. שום דבר כאן אינו מיוצר בייצור המוני. כל פריט נושא את אי-הסדירות הקטנה של היד שיצרה אותו, ולדעתי זו בדיוק הנקודה.\n\n## איך הדברים נוצרים\n\nהעבודה שלי נעה בין שלושה שולחנות — שולחן צורפות למתכת, אובניים לחרס, ושולחן נמוך לעור. אני יוצק בכסף ובברונזה ממוחזרים, מזגג בחומרים שאני מערבב בעצמי, ומגמר הכול ביד.\n\n## טיפוח ושמירה\n\nלבשו את הפריטים שלכם לעיתים קרובות. הכסף אוהב עור; העור אוהב זמן; הקרמיקה אוהבת מטלית רכה. אם משהו אי-פעם זקוק לתיקון, כתבו לי — תמיד אעזור לפריט לחיות זמן רב יותר.",
    type: "richtext",
  },
  { key: "about_portrait", value_he: img("artist-portrait"), type: "image" },
  { key: "whatsapp_number", value_he: "972500000000", type: "text" },
  {
    key: "whatsapp_message",
    value_he: "היי! הגעתי דרך האתר ואשמח לשמוע עוד על העבודות.",
    type: "text",
  },
  { key: "contact_email", value_he: "studio@example.com", type: "text" },
  { key: "contact_heading", value_he: "בואו נדבר", type: "text" },
  {
    key: "contact_text",
    value_he:
      "יש לכם שאלה על פריט, רעיון להזמנה אישית, או סתם רצון להגיד שלום? אני קורא כל הודעה בעצמי ושמח לעזור למצוא בדיוק את הדבר הנכון.",
    type: "richtext",
  },
  {
    key: "footer_text",
    value_he: "נוצר ביד במנות קטנות. תודה שאתם תומכים באורות וכלים עצמאית.",
    type: "text",
  },
  // Top-of-navbar announcement banner — editable from the admin site-content
  // editor. `banner_enabled` is a "true"/"false" string toggle.
  { key: "banner_enabled", value_he: "true", type: "text" },
  {
    key: "banner_text",
    value_he: "משלוח חינם בהזמנות מעל ₪250",
    type: "text",
  },
  { key: "banner_link", value_he: "/shop", type: "text" },
];

async function main() {
  console.log("Seeding database…");

  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  for (const p of products) {
    await prisma.product.create({
      data: {
        name_he: p.name_he,
        slug: p.slug,
        description_he: p.description_he,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        category: p.category,
        tags_he: p.tags_he,
        inStock: p.stockCount > 0,
        stockCount: p.stockCount,
        featured: p.featured,
        published: p.published,
        images: {
          create: p.images.map((seed, i) => ({
            url: img(seed),
            alt_he: `${p.name_he} — תצוגה ${i + 1}`,
            order: i,
          })),
        },
      },
    });
  }
  console.log(`  ✓ ${products.length} products`);

  for (const c of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: { value_he: c.value_he, type: c.type },
      create: c,
    });
  }
  console.log(`  ✓ ${siteContent.length} site content blocks`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
