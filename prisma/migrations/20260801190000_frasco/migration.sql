-- CreateTable
CREATE TABLE "Frasco" (
    "quien" TEXT NOT NULL PRIMARY KEY,
    "datos" TEXT NOT NULL DEFAULT '{}',
    "actualizado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
