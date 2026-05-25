# Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  role          String   @default("admin")
  createdAt     DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String               // Rich text / markdown
  price       Float
  comparePrice Float?               // Original price for "on sale" display
  category    String?               // Nullable — launch products with no category; artist will start categorizing later. Slugs: "rings", "necklaces", "bracelets", "earrings", "home-decor", etc.
  tags        String?               // Comma-separated tags
  images      ProductImage[]
  inStock     Boolean  @default(true)
  stockCount  Int      @default(0)
  featured    Boolean  @default(false)
  published   Boolean  @default(false)
  orderItems  OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String
  alt       String?
  order     Int     @default(0)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique         // Human-readable e.g. ORD-1001
  status          String      @default("pending")  // pending, confirmed, shipped, delivered, cancelled
  customerName    String
  customerEmail   String
  shippingAddress String                       // JSON string
  phone           String?
  items           OrderItem[]
  subtotal        Float
  shippingCost    Float       @default(0)
  total           Float
  // Morning (Green Invoice) integration
  morningPaymentFormId String?                 // ID of the hosted payment-form request
  morningPaymentFormUrl String?                // Hosted URL we redirected the customer to
  morningTransactionId String?                 // Transaction / payment ID returned by Morning on success
  morningDocumentId String?                    // ID of the tax invoice / receipt document generated
  morningDocumentNumber String?                // Human-readable doc number (e.g. "2026-00123")
  morningDocumentUrl String?                   // Signed URL to the PDF (regenerable on demand)
  paidAt          DateTime?                    // Timestamp when payment succeeded
  documents       MorningDocument[]            // All Morning docs tied to this order (invoice, credit notes, etc.)
  notes           String?                      // Admin notes
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Float                              // Price at time of purchase
  product   Product @relation(fields: [productId], references: [id])
  productId String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
}

model MorningDocument {
  id             String   @id @default(cuid())
  morningId      String   @unique              // Morning's document ID
  type           Int                            // Morning doc type code (320 invoice+receipt, 400 receipt, 330 credit note, etc.)
  number         String                         // Human-readable document number
  amount         Float                          // Document total (positive for invoices, negative for credit notes)
  currency       String   @default("ILS")
  status         String   @default("issued")    // issued, cancelled
  url            String?                        // Cached PDF URL (Morning URLs may expire — regenerate on demand)
  issuedAt       DateTime
  order          Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)
  orderId        String?
  rawPayload     String?                        // JSON snapshot of Morning's response for debugging
  createdAt      DateTime @default(now())
}

model SiteContent {
  id        String   @id @default(cuid())
  key       String   @unique                   // e.g. "hero_title", "hero_subtitle", "about_text"
  value     String                             // Text content (supports markdown)
  type      String   @default("text")          // text, richtext, image
  updatedAt DateTime @updatedAt
}
```
