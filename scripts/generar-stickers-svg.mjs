#!/usr/bin/env node
// Base de stickers dibujada por código: línea fina estilo El Principito según
// DESIGN.md (tinta azul noche, acentos oro y rosa, fondo transparente).
// Gratis y reproducible; conviven con (o se reemplazan por) los generados con IA.
//
// Uso:  node scripts/generar-stickers-svg.mjs
// Salida: public/stickers-base/*.svg  → luego `node scripts/importar-stickers.mjs`

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Paleta v2 (DESIGN.md): tinta granate, rojo bermellón, coral y oro.
const INK = "#4d2126";
const GOLD = "#d9a83f";
const ROSE = "#b3282d";
const VERDE = "#8a8a52";

const carpeta = path.resolve(import.meta.dirname, "..", "public", "stickers-base");
mkdirSync(carpeta, { recursive: true });

// Trazo estándar parametrizado. OJO: nunca añadir otro stroke/stroke-width al
// mismo elemento (atributo duplicado = XML inválido y el SVG no se pinta).
const T = (color = INK, w = 2.6) =>
  `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

const estrella = (cx, cy, r, color = GOLD, op = 1) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    p.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${p.join(" ")}" fill="${color}" fill-opacity="${op}"/>`;
};
const chispa = (cx, cy, r, color = GOLD) =>
  `<path d="M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z" fill="${color}"/>`;

// Cada sticker: viewBox 120×120, dibujo centrado con aire.
const stickers = {
  "estrella-dorada": estrella(60, 60, 34),
  "trio-de-estrellas": `${estrella(38, 74, 16)}${estrella(66, 42, 22)}${estrella(88, 78, 12)}`,
  "estrella-fugaz": `
    <path d="M18 84 C40 72 66 56 88 40" ${T(INK, 2.6)} stroke-dasharray="1 10"/>
    ${chispa(94, 34, 14)}`,
  "luna-y-estrella": `
    <path d="M74 22 A40 40 0 1 0 74 98 A32 32 0 1 1 74 22 Z" fill="${GOLD}" fill-opacity="0.9"/>
    ${chispa(84, 40, 8, INK)}`,
  "planeta-del-principito": `
    <circle cx="60" cy="60" r="34" ${T()}/>
    <path d="M30 52 C42 60 78 60 90 52" ${T(INK, 2)}/>
    <path d="M52 26 v-8" ${T(ROSE, 2)}/>
    <path d="M52 18 c-3 -1 -4 -5 -2 -7 c3 0 4 3 2 7 z" ${T(ROSE, 2)}/>
    ${chispa(96, 26, 7)}${chispa(20, 78, 5)}`,
  "la-rosa": `
    <path d="M60 66 V100" ${T(VERDE)}/>
    <path d="M60 84 c-8 -2 -12 -8 -12 -14" ${T(VERDE, 2.2)}/>
    <path d="M60 90 c8 -2 12 -8 12 -14" ${T(VERDE, 2.2)}/>
    <path d="M48 52 c0 -10 5 -18 12 -22 c7 4 12 12 12 22 c0 9 -5 16 -12 16 c-7 0 -12 -7 -12 -16 z" fill="${ROSE}" fill-opacity="0.25" stroke="${ROSE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M54 48 c2 -8 4 -12 6 -14 m6 16 c-1 -7 -3 -11 -6 -14" ${T(ROSE, 2)}/>`,
  "rosa-con-cupula": `
    <path d="M32 88 a28 34 0 0 1 56 0" ${T()}/>
    <line x1="24" y1="88" x2="96" y2="88" ${T()}/>
    <circle cx="60" cy="46" r="3.4" fill="${INK}"/>
    <path d="M60 82 V58" ${T(VERDE, 2.2)}/>
    <path d="M52 56 c2 -6 5 -9 8 -10 c3 1 6 4 8 10 c0 5 -3 9 -8 9 c-5 0 -8 -4 -8 -9 z" fill="${ROSE}" fill-opacity="0.3" stroke="${ROSE}" stroke-width="2.2" stroke-linejoin="round"/>`,
  "el-zorro": `
    <path d="M38 44 l-6 -14 12 4 M82 44 l6 -14 -12 4" ${T()}/>
    <path d="M32 46 c6 -8 18 -12 28 -12 c10 0 22 4 28 12 c-2 16 -12 30 -28 30 c-16 0 -26 -14 -28 -30 z" ${T()}/>
    <circle cx="48" cy="52" r="2.6" fill="${INK}"/>
    <circle cx="72" cy="52" r="2.6" fill="${INK}"/>
    <path d="M56 64 c2 2 6 2 8 0 M60 64 v-4" ${T(INK, 2)}/>
    <path d="M84 78 c10 2 16 8 14 16 c-8 2 -14 -4 -14 -16 z" fill="${GOLD}" fill-opacity="0.35" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`,
  "avioneta": `
    <path d="M30 62 h48 c8 0 12 -4 12 -8 h-44" ${T()}/>
    <path d="M46 54 l-8 -14 h10 l10 14" ${T()}/>
    <path d="M46 62 l-6 12 h9 l8 -12" ${T()}/>
    <path d="M28 50 c-4 2 -4 10 0 12" ${T(INK, 2.2)}/>
    <path d="M94 40 c4 6 4 12 0 14" ${T(GOLD, 2.2)} stroke-dasharray="1 7"/>
    ${chispa(102, 30, 6)}`,
  "sombrero-o-serpiente": `
    <path d="M18 82 c4 -30 18 -46 42 -46 c24 0 38 16 42 46" ${T()}/>
    <line x1="10" y1="82" x2="110" y2="82" ${T()}/>
    <circle cx="44" cy="60" r="2" fill="${INK}"/>`,
  "baobab": `
    <path d="M60 102 V50" ${T(INK, 3)}/>
    <path d="M60 70 C46 68 38 58 38 44 M60 62 C74 60 82 50 82 38 M60 82 c-9 0 -15 -4 -18 -10" ${T()}/>
    <circle cx="38" cy="36" r="10" fill="${VERDE}" fill-opacity="0.55"/>
    <circle cx="82" cy="30" r="11" fill="${VERDE}" fill-opacity="0.55"/>
    <circle cx="60" cy="22" r="9" fill="${VERDE}" fill-opacity="0.55"/>
    <circle cx="40" cy="66" r="7" fill="${VERDE}" fill-opacity="0.45"/>`,
  "bufanda-al-viento": `
    <path d="M30 40 c14 -6 26 -6 34 0 c-2 10 -8 14 -10 24 c14 -8 30 -10 44 -4" ${T(GOLD)}/>
    <path d="M36 50 c10 -4 18 -4 24 0 M62 56 c12 -6 24 -8 34 -4" ${T(GOLD, 2)} stroke-dasharray="1 8"/>`,
  "farol": `
    <path d="M52 34 h16 M56 34 v-6 h8 v6" ${T()}/>
    <path d="M48 34 l4 34 h16 l4 -34 z" ${T()}/>
    <path d="M52 78 h16 M56 68 v10 M64 68 v10" ${T()}/>
    ${chispa(60, 52, 8)}`,
  "constelacion-corazon": `
    <path d="M60 88 C34 68 26 50 36 38 C44 30 56 34 60 44 C64 34 76 30 84 38 C94 50 86 68 60 88 Z" ${T(INK, 2.2)} stroke-dasharray="1 9"/>
    ${[[60, 88], [36, 38], [60, 44], [84, 38], [27, 55], [93, 55]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${GOLD}"/>`)
      .join("")}`,
  "sobre-con-sello": `
    <rect x="22" y="36" width="76" height="52" rx="6" ${T()}/>
    <path d="M24 40 L60 66 L96 40" ${T()}/>
    ${estrella(60, 74, 9)}`,
  "pluma-que-escribe": `
    <path d="M34 90 C46 60 66 38 88 26 C82 48 64 72 40 86 Z" ${T()}/>
    <path d="M40 84 C56 64 70 48 82 34" ${T(INK, 2)}/>
    <path d="M30 96 c8 -2 12 -4 16 -8" ${T(INK, 2.2)}/>
    ${chispa(96, 20, 6)}`,
  "globo-aerostatico": `
    <circle cx="60" cy="44" r="26" ${T()}/>
    <path d="M46 66 l4 14 h20 l4 -14" ${T(INK, 2.2)}/>
    <rect x="50" y="80" width="20" height="12" rx="3" ${T()}/>
    <path d="M60 18 v52 M42 30 c10 8 26 8 36 0" ${T(INK, 2)}/>`,
  "pozo-en-el-desierto": `
    <path d="M34 92 h52 M38 92 l4 -20 h36 l4 20" ${T()}/>
    <path d="M42 72 l18 -34 18 34" ${T()}/>
    <circle cx="60" cy="58" r="5" ${T(INK, 2.2)}/>
    <path d="M60 63 v9" ${T(INK, 2.2)}/>
    ${chispa(60, 20, 7)}`,
  "corona-sencilla": `
    <path d="M30 78 l-4 -34 16 12 18 -22 18 22 16 -12 -4 34 z" ${T()}/>
    <circle cx="60" cy="66" r="3.5" fill="${GOLD}"/>`,
  "corazon-de-una-linea": `
    <path d="M24 66 C24 42 48 38 60 54 C72 38 96 42 96 66 C96 84 70 96 60 100 C50 96 24 84 24 66" ${T(ROSE)}/>
    ${chispa(90, 30, 6)}`,
};

let n = 0;
for (const [nombre, cuerpo] of Object.entries(stickers)) {
  n++;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">\n${cuerpo}\n</svg>\n`;
  writeFileSync(path.join(carpeta, `${String(n).padStart(2, "0")}-${nombre}.svg`), svg);
}
console.log(`Generados ${n} stickers SVG en ${carpeta}`);
