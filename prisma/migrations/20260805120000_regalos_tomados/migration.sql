-- CreateTable
CREATE TABLE "RegaloTomado" (
    "regaloId" TEXT NOT NULL PRIMARY KEY,
    "quien" TEXT NOT NULL,
    "tomadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
