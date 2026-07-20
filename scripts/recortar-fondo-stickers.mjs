#!/usr/bin/env node
// Quita el DISCO BLANCO de los stickers del Principito (el troquel de
// WhatsApp) dejando solo la ilustración con fondo transparente de verdad.
//
// No se puede borrar "todo lo blanco": las acuarelas tienen blancos internos.
// Se hace un flood-fill desde los bordes de la imagen que avanza únicamente
// por píxeles de fondo (transparentes o casi blancos CONECTADOS con el
// exterior); los blancos interiores rodeados de trazo sobreviven.
//
// Regenera web/ (1024px) y 4k/ (4096px) desde los originales de .webp-orig.
// Uso: node scripts/recortar-fondo-stickers.mjs

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const raiz = path.resolve(import.meta.dirname, "..");
const dirOrig = path.join(raiz, "public", "stickers-principito", ".webp-orig");
const dir4k = path.join(raiz, "public", "stickers-principito", "4k");
const dirWeb = path.join(raiz, "public", "stickers-principito", "web");

// Umbral de "fondo": casi blanco y poco saturado, o ya transparente.
const esBlanco = (r, g, b) => r >= 232 && g >= 232 && b >= 232;

async function recortar(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const px = data; // RGBA
  const visitado = new Uint8Array(W * H);
  const cola = [];

  const esFondo = (i) => {
    const o = i * 4;
    return px[o + 3] < 20 || esBlanco(px[o], px[o + 1], px[o + 2]);
  };

  // semillas: todo el borde de la imagen
  for (let x = 0; x < W; x++) {
    cola.push(x, (H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    cola.push(y * W, y * W + W - 1);
  }

  while (cola.length) {
    const i = cola.pop();
    if (visitado[i] || !esFondo(i)) continue;
    visitado[i] = 1;
    px[i * 4 + 3] = 0; // transparente
    const x = i % W;
    const y = (i / W) | 0;
    if (x > 0) cola.push(i - 1);
    if (x < W - 1) cola.push(i + 1);
    if (y > 0) cola.push(i - W);
    if (y < H - 1) cola.push(i + W);
  }

  // Borde suave: los píxeles opacos pegados al recorte bajan un poco su alfa
  // para no dejar un filo blanco duro alrededor de la ilustración.
  const alfaOriginal = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) alfaOriginal[i] = px[i * 4 + 3];
  for (let i = 0; i < W * H; i++) {
    if (alfaOriginal[i] === 0) continue;
    const x = i % W;
    const y = (i / W) | 0;
    let vecinosFuera = 0;
    if (x > 0 && alfaOriginal[i - 1] === 0) vecinosFuera++;
    if (x < W - 1 && alfaOriginal[i + 1] === 0) vecinosFuera++;
    if (y > 0 && alfaOriginal[i - W] === 0) vecinosFuera++;
    if (y < H - 1 && alfaOriginal[i + W] === 0) vecinosFuera++;
    if (vecinosFuera > 0) {
      px[i * 4 + 3] = Math.round(alfaOriginal[i] * (1 - vecinosFuera * 0.22));
    }
  }

  return sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

const files = (await readdir(dirOrig)).filter((f) => f.endsWith(".webp")).sort();
console.log(`${files.length} stickers a recortar.\n`);

for (const f of files) {
  const base = f.replace(/\.webp$/, "");
  const orig = await readFile(path.join(dirOrig, f));
  const recortado = await recortar(orig);

  await sharp(recortado)
    .resize(4096, 4096, { fit: "inside", kernel: "lanczos3" })
    .sharpen({ sigma: 1.2, m1: 0.6, m2: 0.4 })
    .png({ compressionLevel: 9, palette: true, colors: 256 })
    .toFile(path.join(dir4k, `${base}.png`));
  await sharp(recortado)
    .resize(1024, 1024, { fit: "inside", kernel: "lanczos3" })
    .png({ compressionLevel: 9, palette: true, colors: 256 })
    .toFile(path.join(dirWeb, `${base}.png`));
  console.log(`✓ ${base}`);
}
console.log("\nFondos eliminados; web/ y 4k/ regenerados.");
