#!/usr/bin/env node
// Exporta los stickers SVG de public/stickers-base/ a PNG 4K con fondo
// transparente en public/stickers-4k/. Al ser vectores, el render a 4096px
// conserva el estilo EXACTO (trazo granate, acentos rojo/coral/oro) sin
// inventar detalle: es el "enhance" sin pérdida.
//
// Uso: node scripts/exportar-stickers-png.mjs

import { readdir, readFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/stickers-base";
const OUT = "public/stickers-4k";
const SIZE = 4096; // lado mayor en px

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".svg")).sort();
if (files.length === 0) {
  console.error(`No hay SVGs en ${SRC}`);
  process.exit(1);
}

let ok = 0;
for (const f of files) {
  const svg = await readFile(path.join(SRC, f));
  // El viewBox manda la proporción; density alta para que el rasterizado
  // interno de librsvg no pixele los trazos antes del resize.
  const png = path.join(OUT, f.replace(/\.svg$/, ".png"));
  await sharp(svg, { density: 2400 })
    .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(png);
  const meta = await sharp(png).metadata();
  const kb = Math.round((await stat(png)).size / 1024);
  if (!meta.hasAlpha) {
    console.error(`✗ ${f}: el PNG salió SIN canal alfa`);
    process.exit(1);
  }
  console.log(`✓ ${path.basename(png)} ${meta.width}×${meta.height} (${kb} KB, alfa)`);
  ok++;
}
console.log(`\n${ok}/${files.length} stickers exportados a ${OUT}/ en ${SIZE}px con fondo transparente.`);
