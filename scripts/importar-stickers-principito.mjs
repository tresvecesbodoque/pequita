#!/usr/bin/env node
// Importa el pack de stickers "The Little Prince" (@Stickerabad) desde
// stickers.wiki: descarga los webp a tamaño completo, los convierte a PNG con
// fondo transparente en dos tamaños y registra la versión web en la BD local
// como stickers DECORATIVO del estudio.
//
//   public/stickers-principito/4k/  → 4096px (archivo/imprenta, sin pérdida de estilo)
//   public/stickers-principito/web/ → 1024px (los que usa el estudio; livianos)
//
// Uso:  node scripts/importar-stickers-principito.mjs
// Idempotente: salta descargas ya hechas y filas ya registradas.

import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PACK_URL = "https://stickers.wiki/es/whatsapp/tlp_stickerabad/";
const raiz = path.resolve(import.meta.dirname, "..");
const dir4k = path.join(raiz, "public", "stickers-principito", "4k");
const dirWeb = path.join(raiz, "public", "stickers-principito", "web");
const dirTmp = path.join(raiz, "public", "stickers-principito", ".webp-orig");
const db = path.join(raiz, "dev.db");
const sql = (q) => execFileSync("sqlite3", [db, q], { encoding: "utf-8" }).trim();

await mkdir(dir4k, { recursive: true });
await mkdir(dirWeb, { recursive: true });
await mkdir(dirTmp, { recursive: true });

// 1) URLs a tamaño completo (los .thumb son miniaturas: se descartan)
const html = await (await fetch(PACK_URL)).text();
const urls = [
  ...new Set(
    [...html.matchAll(/https:\/\/assets\.stickerswiki\.app\/s\/tlp_stickerabad\/([a-f0-9]+)\.webp/g)]
      .map((m) => m[0])
      .filter((u) => !u.includes(".thumb"))
  ),
].sort();
if (urls.length === 0) {
  console.error("No se encontraron stickers en la página del pack.");
  process.exit(1);
}
console.log(`${urls.length} stickers en el pack.\n`);

let i = 0;
let nuevos = 0;
for (const url of urls) {
  i++;
  const hash = url.match(/([a-f0-9]+)\.webp$/)[1];
  const nn = String(i).padStart(2, "0");
  const base = `principito-${nn}-${hash}`;
  const rutaWebp = path.join(dirTmp, `${base}.webp`);
  const ruta4k = path.join(dir4k, `${base}.png`);
  const rutaWeb = path.join(dirWeb, `${base}.png`);

  if (!existsSync(rutaWebp)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`✗ ${url}: HTTP ${res.status}`);
      continue;
    }
    await writeFile(rutaWebp, Buffer.from(await res.arrayBuffer()));
  }

  const orig = await readFile(rutaWebp);
  const meta = await sharp(orig).metadata();

  // 4K: Lanczos3 + realce suave del trazo. (Es interpolación honesta del
  // original de ~512px: conserva estilo y transparencia, no inventa detalle.)
  if (!existsSync(ruta4k)) {
    await sharp(orig)
      .resize(4096, 4096, { fit: "inside", kernel: "lanczos3" })
      .sharpen({ sigma: 1.2, m1: 0.6, m2: 0.4 })
      .png({ compressionLevel: 9, palette: true, colors: 256 })
      .toFile(ruta4k);
  }
  // Web: 1024px, ligero, para el lienzo del estudio.
  if (!existsSync(rutaWeb)) {
    await sharp(orig)
      .resize(1024, 1024, { fit: "inside", kernel: "lanczos3" })
      .png({ compressionLevel: 9, palette: true, colors: 256 })
      .toFile(rutaWeb);
  }

  const m4k = await sharp(ruta4k).metadata();
  if (!m4k.hasAlpha) {
    console.error(`✗ ${base}: el PNG 4K salió sin canal alfa`);
    process.exit(1);
  }
  const kb4k = Math.round((await stat(ruta4k)).size / 1024);

  // 2) Registro en la BD (solo la versión web)
  const imageUrl = `/stickers-principito/web/${base}.png`;
  if (sql(`SELECT COUNT(*) FROM Sticker WHERE imageUrl='${imageUrl}';`) === "0") {
    sql(
      `INSERT INTO Sticker (id, type, imageUrl, name, createdAt)
       VALUES ('${randomUUID()}', 'DECORATIVO', '${imageUrl}', 'principito ${nn}', datetime('now'));`
    );
    nuevos++;
  }
  console.log(`✓ ${base}  ${meta.width}×${meta.height} → 4K ${m4k.width}×${m4k.height} (${kb4k} KB) + web 1024`);
}

console.log(`\nListo: ${urls.length} stickers en public/stickers-principito/ (4k y web); ${nuevos} nuevos en la BD del estudio.`);
