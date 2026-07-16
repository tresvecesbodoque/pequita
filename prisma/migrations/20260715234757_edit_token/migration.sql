ALTER TABLE "Letter" ADD COLUMN "editToken" TEXT;
CREATE UNIQUE INDEX "Letter_editToken_key" ON "Letter"("editToken");
