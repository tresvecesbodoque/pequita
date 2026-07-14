-- CreateTable
CREATE TABLE "Sticker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "name" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Sin título',
    "esquelaStickerId" TEXT,
    "esquelaCanvas" TEXT NOT NULL DEFAULT '{"elements":[],"canvasWidth":1000,"canvasHeight":1400}',
    "esquelaBaseImageUrl" TEXT,
    "sobreCanvas" TEXT NOT NULL DEFAULT '{"elements":[],"canvasWidth":1400,"canvasHeight":900}',
    "sobreBaseImageUrl" TEXT,
    "sobreColor" TEXT DEFAULT '#d6c7a1',
    "backgroundType" TEXT NOT NULL DEFAULT 'PRESET',
    "backgroundPresetId" TEXT,
    "backgroundImageUrl" TEXT,
    "backgroundScale" INTEGER,
    "qrInteriorDataUrl" TEXT,
    "qrExteriorDataUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Letter_esquelaStickerId_fkey" FOREIGN KEY ("esquelaStickerId") REFERENCES "Sticker" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Letter_slug_key" ON "Letter"("slug");
