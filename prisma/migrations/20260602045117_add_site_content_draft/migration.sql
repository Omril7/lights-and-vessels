-- CreateTable
CREATE TABLE "SiteContentDraft" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContentDraft_pkey" PRIMARY KEY ("key")
);
