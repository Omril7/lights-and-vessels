import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/1100`;

type SeedProduct = {
  name_he: string;
  name_en: string;
  slug: string;
  description_he: string;
  description_en: string;
  price: number;
  comparePrice?: number;
  category: string;
  tags_he: string;
  tags_en: string;
  stockCount: number;
  featured: boolean;
  published: boolean;
  images: { seed: string; alt_he: string; alt_en: string }[];
};

const products: SeedProduct[] = [
  {
    name_he: "טבעת חותם בריכת גאות",
    name_en: "Tidepool Signet Ring",
    slug: "tidepool-signet-ring",
    description_he:
      "יצוקה ממקור שעווה מגולף ביד, **טבעת בריכת הגאות** נושאת בריכה של אמייל בגוון טורקיז עמוק, משובצת בכסף סטרלינג ממוחזר.\n\nכל טבעת מוגמרת בעבודת יד, ולכן אין שתי טבעות שתופסות את האור באותו אופן בדיוק. פריט שקט, שנועד לשימוש יומיומי.\n\n## פרטים\n- כסף סטרלינג ממוחזר\n- אמייל יצוק ביד\n- מיוצרת לפי הזמנה תוך שבוע-שבועיים",
    description_en:
      "Cast from hand-carved wax, the **Tidepool Signet** carries a pool of deep turquoise enamel set in recycled sterling silver.\n\nEach ring is hand-finished, so no two catch the light in exactly the same way. A quiet piece built for everyday wear.\n\n## Details\n- Recycled sterling silver\n- Hand-poured enamel\n- Made to order in one to two weeks",
    price: 620,
    category: "rings",
    tags_he: "כסף, אמייל, סטייטמנט",
    tags_en: "silver, enamel, statement",
    stockCount: 6,
    featured: true,
    published: true,
    images: [
      { seed: "ring-tide-1", alt_he: "טבעת חותם בריכת גאות — תצוגה 1", alt_en: "Tidepool Signet Ring — view 1" },
      { seed: "ring-tide-2", alt_he: "טבעת חותם בריכת גאות — תצוגה 2", alt_en: "Tidepool Signet Ring — view 2" },
    ],
  },
  {
    name_he: "טבעת הקשה דקה",
    name_en: "Hammered Stacking Band",
    slug: "hammered-stacking-band",
    description_he:
      "טבעת דקה עם משטח מוקש בעדינות שמפזר את האור כמו מים. תוכננה כדי להילבש לבד או בערימה של שלוש-ארבע יחד.\n\nהמרקם מורם יחידה אחר יחידה בעזרת פטיש צורפים — גימור כן, של עבודת יד.",
    description_en:
      "A slender band with a gently hammered surface that scatters light like water. Designed to be worn alone or stacked three or four together.\n\nThe texture is raised stroke by stroke with a silversmith's hammer — an honest, handmade finish.",
    price: 240,
    comparePrice: 310,
    category: "rings",
    tags_he: "כסף, מינימלי, לערימה",
    tags_en: "silver, minimal, stacking",
    stockCount: 22,
    featured: false,
    published: true,
    images: [
      { seed: "ring-band-1", alt_he: "טבעת הקשה דקה — תצוגה 1", alt_en: "Hammered Stacking Band — view 1" },
      { seed: "ring-band-2", alt_he: "טבעת הקשה דקה — תצוגה 2", alt_en: "Hammered Stacking Band — view 2" },
    ],
  },
  {
    name_he: "תליון ענף זית",
    name_en: "Olive Branch Pendant",
    slug: "olive-branch-pendant",
    description_he:
      "זרד זית מוטבע בברונזה, ומושחל על שרשרת כסף מחומצנת באורך 45 ס\"מ. מחווה קטנה לאחר צהריים ים-תיכוניים ואיטיים.\n\nהעלים יצוקים מענף אמיתי שנקטף מגינת הסטודיו.",
    description_en:
      "An olive sprig cast in bronze, threaded onto an oxidised silver chain measuring 45 cm. A small nod to slow Mediterranean afternoons.\n\nThe leaves were cast from a real branch picked from the studio garden.",
    price: 460,
    category: "necklaces",
    tags_he: "ברונזה, בוטני, יומיומי",
    tags_en: "bronze, botanical, everyday",
    stockCount: 9,
    featured: true,
    published: true,
    images: [
      { seed: "neck-olive-1", alt_he: "תליון ענף זית — תצוגה 1", alt_en: "Olive Branch Pendant — view 1" },
      { seed: "neck-olive-2", alt_he: "תליון ענף זית — תצוגה 2", alt_en: "Olive Branch Pendant — view 2" },
    ],
  },
  {
    name_he: "שרשרת אבן נהר",
    name_en: "Riverstone Drop Necklace",
    slug: "riverstone-drop-necklace",
    description_he:
      "אבן ג'ספר מלוטשת אחת, עטופה במסגרת כסף עדינה ותלויה על שרשרת חוליות דקה. אדמתי, מקרקע, ונועז בשקט.\n\nמכיוון שכל אבן היא טבעית, הגוון והעורקים של הפריט שלך יהיו ייחודיים לחלוטין.",
    description_en:
      "A single polished jasper stone, set in a delicate silver frame and hung on a fine link chain. Earthy, grounding, quietly bold.\n\nBecause every stone is natural, the tone and grain of your piece will be entirely its own.",
    price: 530,
    category: "necklaces",
    tags_he: "ג'ספר, אבן, ייחודי",
    tags_en: "jasper, stone, unique",
    stockCount: 0,
    featured: false,
    published: true,
    images: [
      { seed: "neck-river-1", alt_he: "שרשרת אבן נהר — תצוגה 1", alt_en: "Riverstone Drop Necklace — view 1" },
      { seed: "neck-river-2", alt_he: "שרשרת אבן נהר — תצוגה 2", alt_en: "Riverstone Drop Necklace — view 2" },
    ],
  },
  {
    name_he: "עגילי דיסקית חרס",
    name_en: "Clay Disc Earrings",
    slug: "clay-disc-earrings",
    description_he:
      "דיסקיות קלות מחרס אבן מגולגל ביד, מזוגגות בגוון טרקוטה חמים ומוגמרות בווי אוזן מצופי זהב.\n\nקלילים כנוצה ומיועדים לשימוש לאורך כל היום.",
    description_en:
      "Lightweight discs of hand-rolled stoneware, glazed in warm terracotta and finished with gold-filled ear wires.\n\nLight as a feather and made to wear all day.",
    price: 180,
    category: "earrings",
    tags_he: "קרמיקה, טרקוטה, קליל",
    tags_en: "ceramic, terracotta, lightweight",
    stockCount: 18,
    featured: true,
    published: true,
    images: [
      { seed: "ear-clay-1", alt_he: "עגילי דיסקית חרס — תצוגה 1", alt_en: "Clay Disc Earrings — view 1" },
      { seed: "ear-clay-2", alt_he: "עגילי דיסקית חרס — תצוגה 2", alt_en: "Clay Disc Earrings — view 2" },
    ],
  },
  {
    name_he: "עגילי סהר נמשכים",
    name_en: "Crescent Thread Earrings",
    slug: "crescent-thread-earrings",
    description_he:
      "עגילי סהר דקיקים מצופי זהב מוקשים, שמשרטטים את קימור האוזן. מודרניים, חסרי משקל וקלים מאוד ללבישה.",
    description_en:
      "Slender hammered gold-filled crescents that trace the curve of the ear. Modern, weightless, effortless to wear.",
    price: 270,
    comparePrice: 340,
    category: "earrings",
    tags_he: "מצופה זהב, נמשך, מודרני",
    tags_en: "gold-filled, threader, modern",
    stockCount: 14,
    featured: false,
    published: true,
    images: [
      { seed: "ear-crescent-1", alt_he: "עגילי סהר נמשכים — תצוגה 1", alt_en: "Crescent Thread Earrings — view 1" },
      { seed: "ear-crescent-2", alt_he: "עגילי סהר נמשכים — תצוגה 2", alt_en: "Crescent Thread Earrings — view 2" },
    ],
  },
  {
    name_he: "צמיד עור קלוע",
    name_en: "Woven Leather Cuff",
    slug: "woven-leather-cuff",
    description_he:
      "עור מעובד בעיבוד צמחי, קלוע ביד סביב שלד פליז, עם וו סגירה מחושל. העור מתרכך ומעמיק בגוונו ככל שלובשים אותו.",
    description_en:
      "Vegetable-tanned leather woven by hand around a brass armature, with a forged hook clasp. The leather softens and deepens in colour with wear.",
    price: 360,
    category: "bracelets",
    tags_he: "עור, פליז, יוניסקס",
    tags_en: "leather, brass, unisex",
    stockCount: 11,
    featured: false,
    published: true,
    images: [
      { seed: "brace-cuff-1", alt_he: "צמיד עור קלוע — תצוגה 1", alt_en: "Woven Leather Cuff — view 1" },
      { seed: "brace-cuff-2", alt_he: "צמיד עור קלוע — תצוגה 2", alt_en: "Woven Leather Cuff — view 2" },
    ],
  },
  {
    name_he: "צמיד שרשרת קשרים",
    name_en: "Knotted Silver Chain Bracelet",
    slug: "knotted-silver-chain-bracelet",
    description_he:
      "שרשרת חוליות מסיבית שנקטעת בשלושה קשרי כסף קשורים ביד — חידה קטנה של צמיד שמרגישה נפלא בכף היד.",
    description_en:
      "A chunky link chain interrupted by three hand-tied silver knots — a small riddle of a bracelet that feels wonderful in the palm.",
    price: 590,
    category: "bracelets",
    tags_he: "כסף, שרשרת, סטייטמנט",
    tags_en: "silver, chain, statement",
    stockCount: 5,
    featured: true,
    published: true,
    images: [
      { seed: "brace-knot-1", alt_he: "צמיד שרשרת קשרים — תצוגה 1", alt_en: "Knotted Silver Chain Bracelet — view 1" },
      { seed: "brace-knot-2", alt_he: "צמיד שרשרת קשרים — תצוגה 2", alt_en: "Knotted Silver Chain Bracelet — view 2" },
    ],
  },
  {
    name_he: "אגרטל קרמיקה אדווה",
    name_en: "Ripple Ceramic Bud Vase",
    slug: "ripple-ceramic-bud-vase",
    description_he:
      "אגרטל פריחה מחרס אבן, מעוצב על אובניים, עם שפה מתאדוות וזיגוג מנוקד בגוון שיבולת שועל. בדיוק בגודל הנכון לגבעול בודד או לזרד של עשב מיובש.",
    description_en:
      "A wheel-thrown stoneware bud vase with a rippled rim and a speckled oatmeal glaze. Just the right size for a single stem or a sprig of dried grass.",
    price: 195,
    category: "home-decor",
    tags_he: "קרמיקה, אגרטל, סטודיו",
    tags_en: "ceramic, vase, studio",
    stockCount: 16,
    featured: false,
    published: true,
    images: [
      { seed: "home-vase-1", alt_he: "אגרטל קרמיקה אדווה — תצוגה 1", alt_en: "Ripple Ceramic Bud Vase — view 1" },
      { seed: "home-vase-2", alt_he: "אגרטל קרמיקה אדווה — תצוגה 2", alt_en: "Ripple Ceramic Bud Vase — view 2" },
    ],
  },
  {
    name_he: "נר שעוות דבורים יצוק ביד",
    name_en: "Hand-Poured Beeswax Candle",
    slug: "hand-poured-beeswax-candle",
    description_he:
      "שעוות דבורים טהורה יצוקה לתוך כלי חרס רב-פעמי, מבושמת קלות מהשעווה עצמה — דבש, חמימות, שום דבר סינתטי. זמן בעירה של כ-40 שעות.",
    description_en:
      "Pure beeswax poured into a reusable ceramic vessel, scented only by the wax itself — honey, warmth, nothing synthetic. About 40 hours of burn time.",
    price: 135,
    comparePrice: 165,
    category: "home-decor",
    tags_he: "נר, שעוות דבורים, מתנה",
    tags_en: "candle, beeswax, gift",
    stockCount: 27,
    featured: false,
    published: true,
    images: [
      { seed: "home-candle-1", alt_he: "נר שעוות דבורים יצוק ביד — תצוגה 1", alt_en: "Hand-Poured Beeswax Candle — view 1" },
      { seed: "home-candle-2", alt_he: "נר שעוות דבורים יצוק ביד — תצוגה 2", alt_en: "Hand-Poured Beeswax Candle — view 2" },
    ],
  },
];

const siteContent: { key: string; value_he: string; value_en?: string; type: string }[] = [
  {
    key: "hero_title",
    value_he: "חפצים שנוצרים לאט, ביד",
    value_en: "Objects made slowly, by hand",
    type: "text",
  },
  {
    key: "hero_subtitle",
    value_he: "אוסף סטודיו קטן של תכשיטים וחפצים לבית — יצוקים, מעוצבים על אובניים ומוגמרים פריט אחר פריט.",
    value_en: "A small studio collection of jewellery and home objects — cast, thrown on the wheel, and finished piece by piece.",
    type: "text",
  },
  { key: "hero_image", value_he: 'https://ysadurdujhhpibudwjdj.supabase.co/storage/v1/object/public/site-images/content/2026/ab5067f8-6eef-43c3-8752-841f34be5137.png', type: "image" },
  {
    key: "hero_cta",
    value_he: "לגלות את האוסף",
    value_en: "Explore the collection",
    type: "text",
  },
  {
    key: "story_teaser",
    value_he: "הכול כאן מתחיל על שולחן עץ בלוי לצד חלון הפונה צפונה. אני עובד במנות קטנות, בידיים, בלי שום חיפזון — ומניח לכל חומר לרמוז למה שהוא רוצה להפוך.",
    value_en: "Everything here begins at a worn wooden table beside a north-facing window. I work in small batches, by hand, without hurry — letting each material suggest what it wants to become.",
    type: "richtext",
  },
  { key: "story_image", value_he: img("studio-bench"), type: "image" },
  {
    key: "about_text",
    value_he:
      "## סטודיו של אדם אחד\n\nאני יוצר שעובד מסטודיו מואר בקצה העיר. כבר יותר מעשור אני מעצב מתכת, חרס ועור לחפצים קטנים שנועדו לחיות לצדנו — להישחק לחלקות, לעבור הלאה, להישמר.\n\nאני מאמין ב**יצירה איטית**. שום דבר כאן אינו מיוצר בייצור המוני. כל פריט נושא את אי-הסדירות הקטנה של היד שיצרה אותו, ולדעתי זו בדיוק הנקודה.\n\n## איך הדברים נוצרים\n\nהעבודה שלי נעה בין שלושה שולחנות — שולחן צורפות למתכת, אובניים לחרס, ושולחן נמוך לעור. אני יוצק בכסף ובברונזה ממוחזרים, מזגג בחומרים שאני מערבב בעצמי, ומגמר הכול ביד.\n\n## טיפוח ושמירה\n\nלבשו את הפריטים שלכם לעיתים קרובות. הכסף אוהב עור; העור אוהב זמן; הקרמיקה אוהבת מטלית רכה. אם משהו אי-פעם זקוק לתיקון, כתבו לי — תמיד אעזור לפריט לחיות זמן רב יותר.",
    value_en:
      "## A one-person studio\n\nI'm a maker who works from a light-filled studio at the edge of the city. For more than a decade I've been shaping metal, clay and leather into small objects intended to live beside us — to wear smooth, to be passed on, to be kept.\n\nI believe in **slow making**. Nothing here is mass produced. Every piece carries the small irregularities of the hand that made it, and I think that's precisely the point.\n\n## How things are made\n\nMy work moves between three benches — a jeweller's bench for metal, the wheel for clay, and a low table for leather. I cast in recycled silver and bronze, glaze with materials I mix myself, and hand-finish everything.\n\n## Care and keeping\n\nWear your pieces often. Silver loves skin; leather loves time; ceramics love a soft cloth. If something ever needs repair, write to me — I'll always help a piece live longer.",
    type: "richtext",
  },
  { key: "about_portrait", value_he: img("artist-portrait"), type: "image" },
  { key: "whatsapp_number", value_he: "972500000000", type: "text" },
  {
    key: "whatsapp_message",
    value_he: "היי! הגעתי דרך האתר ואשמח לשמוע עוד על העבודות.",
    value_en: "Hi! I found you through the website and I'd love to hear more about your work.",
    type: "text",
  },
  { key: "contact_email", value_he: "studio@example.com", type: "text" },
  {
    key: "contact_heading",
    value_he: "בואו נדבר",
    value_en: "Let's talk",
    type: "text",
  },
  {
    key: "contact_text",
    value_he: "יש לכם שאלה על פריט, רעיון להזמנה אישית, או סתם רצון להגיד שלום? אני קורא כל הודעה בעצמי ושמח לעזור למצוא בדיוק את הדבר הנכון.",
    value_en: "Have a question about a piece, an idea for a personal commission, or just want to say hello? I read every message myself and I'm happy to help find exactly the right thing.",
    type: "richtext",
  },
  {
    key: "footer_text",
    value_he: "נוצר ביד במנות קטנות. תודה שאתם תומכים באורות וכלים עצמאית.",
    value_en: "Handcrafted in small batches. Thank you for supporting Lights and Vessels independently.",
    type: "text",
  },
  { key: "banner_enabled", value_he: "true", type: "text" },
  {
    key: "banner_text",
    value_he: "משלוח חינם בהזמנות מעל ₪250",
    value_en: "Free shipping on orders over ₪250",
    type: "text",
  },
  { key: "banner_link", value_he: "/shop", type: "text" },
];

async function main() {
  console.log("Seeding database…");

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name_he: p.name_he,
        name_en: p.name_en,
        description_he: p.description_he,
        description_en: p.description_en,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        category: p.category,
        tags_he: p.tags_he,
        tags_en: p.tags_en,
        inStock: p.stockCount > 0,
        stockCount: p.stockCount,
        featured: p.featured,
        published: p.published,
      },
      create: {
        name_he: p.name_he,
        name_en: p.name_en,
        slug: p.slug,
        description_he: p.description_he,
        description_en: p.description_en,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        category: p.category,
        tags_he: p.tags_he,
        tags_en: p.tags_en,
        inStock: p.stockCount > 0,
        stockCount: p.stockCount,
        featured: p.featured,
        published: p.published,
      },
    });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((image, i) => ({
        productId: product.id,
        url: `https://picsum.photos/seed/${image.seed}/900/1100`,
        alt_he: image.alt_he,
        alt_en: image.alt_en,
        order: i,
      })),
    });
  }
  console.log(`  ✓ ${products.length} products`);

  for (const c of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: { value_he: c.value_he, value_en: c.value_en ?? null, type: c.type },
      create: { key: c.key, value_he: c.value_he, value_en: c.value_en ?? null, type: c.type },
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
