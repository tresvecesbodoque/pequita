#!/usr/bin/env node
// Importa los PNG de public/stickers-base a la tabla Sticker de la BD LOCAL
// (dev.db) como stickers DECORATIVO, sirviéndolos desde /stickers-base/….
// Solo para desarrollo: en producción se suben por el taller (que usa Blob).
//
// Uso:  node scripts/importar-stickers.mjs
//
// Es idempotente: si ya existe un sticker con la misma imageUrl, lo salta.

import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const carpeta = path.join(raiz, "public", "stickers-base");
const db = path.join(raiz, "dev.db");

const sql = (q) => execFileSync("sqlite3", [db, q], { encoding: "utf-8" }).trim();

let pngs;
try {
  pngs = readdirSync(carpeta).filter((f) => /\.(png|svg|webp)$/i.test(f));
} catch {
  console.error(`No existe ${carpeta}. Genera primero los stickers (ver scripts/stickers-prompts.txt).`);
  process.exit(1);
}
if (pngs.length === 0) {
  console.error("La carpeta no tiene PNG.");
  process.exit(1);
}

// Purga filas de la base cuyo archivo /stickers-base/ ya no existe (renombrados
// o eliminados), para que el álbum no muestre stickers rotos o duplicados.
const urlsActuales = new Set(pngs.map((f) => `/stickers-base/${f}`));
const filasBase = sql(
  `SELECT imageUrl FROM Sticker WHERE imageUrl LIKE '/stickers-base/%';`
)
  .split("\n")
  .filter(Boolean);
let purgados = 0;
for (const url of filasBase) {
  if (!urlsActuales.has(url)) {
    sql(`DELETE FROM Sticker WHERE imageUrl='${url.replaceAll("'", "''")}';`);
    purgados++;
  }
}

let nuevos = 0;
for (const f of pngs.sort()) {
  const url = `/stickers-base/${f}`;
  const existe = sql(`SELECT COUNT(*) FROM Sticker WHERE imageUrl='${url}';`);
  if (existe !== "0") continue;
  const nombre = f
    .replace(/\.(png|svg|webp)$/i, "")
    .replace(/^\d+-/, "")
    .replaceAll("-", " ");
  sql(
    `INSERT INTO Sticker (id, type, imageUrl, name, createdAt)
     VALUES ('${randomUUID()}', 'DECORATIVO', '${url}', '${nombre.replaceAll("'", "''")}', datetime('now'));`
  );
  nuevos++;
}
console.log(
  `Importados ${nuevos} nuevos, purgados ${purgados} obsoletos (${pngs.length} archivos en total).`
);
