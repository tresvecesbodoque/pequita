#!/usr/bin/env node
// Base de stickers dibujada por código: línea fina estilo El Principito según
// DESIGN.md (tinta azul noche, acentos oro y rosa, fondo transparente).
// Gratis y reproducible; conviven con (o se reemplazan por) los generados con IA.
//
// Uso:  node scripts/generar-stickers-svg.mjs
// Salida: public/stickers-base/*.svg  → luego `node scripts/importar-stickers.mjs`

import { mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

// Paleta v2 (DESIGN.md): tinta granate, rojo bermellón, coral y oro.
const INK = "#4d2126";
const GOLD = "#d9a83f";
const ROSE = "#b3282d";
const CORAL = "#e0745a";
const VERDE = "#8a8a52";

const carpeta = path.resolve(import.meta.dirname, "..", "public", "stickers-base");
mkdirSync(carpeta, { recursive: true });

// Limpia SVG previos para que renombrados/reordenados no dejen huérfanos.
for (const f of readdirSync(carpeta)) {
  if (f.toLowerCase().endsWith(".svg")) rmSync(path.join(carpeta, f));
}

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
// Florcita de bosquejo: 5 pétalos redondos y botón dorado.
const flor = (cx, cy, r, color = ROSE) => {
  const petalos = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const px = (cx + r * Math.cos(a)).toFixed(1);
    const py = (cy + r * Math.sin(a)).toFixed(1);
    petalos.push(
      `<circle cx="${px}" cy="${py}" r="${(r * 0.62).toFixed(1)}" fill="${color}" fill-opacity="0.45" stroke="${color}" stroke-width="1.6"/>`
    );
  }
  return `${petalos.join("")}<circle cx="${cx}" cy="${cy}" r="${(r * 0.45).toFixed(1)}" fill="${GOLD}"/>`;
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
    <path d="M46 30 c8 -4 16 -4 22 0 l-4 18 c12 -4 26 -2 34 6 c-2 6 -8 10 -14 10 c4 4 4 10 0 14 c-10 2 -20 -2 -26 -10 l-14 -8 z" fill="${GOLD}" fill-opacity="0.25" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M52 38 c4 -2 8 -2 12 0 M66 54 c8 -2 16 0 22 4" ${T(INK, 1.8)} stroke-dasharray="1 6"/>
    <path d="M28 22 c3 2 5 5 5 9 M22 30 c4 0 8 2 10 5" ${T(GOLD, 2)}/>`,
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
    <path d="M36 70 h48 M40 70 v22 h40 v-22" ${T()}/>
    <path d="M40 78 h40 M40 86 h40" ${T(INK, 1.6)} stroke-dasharray="2 5"/>
    <path d="M36 70 l10 -22 h28 l10 22" ${T()}/>
    <path d="M60 48 v12 M54 60 h12" ${T(INK, 2.2)}/>
    <circle cx="60" cy="38" r="5" ${T(INK, 2.2)}/>
    <path d="M60 43 v5" ${T(INK, 2.2)}/>
    ${chispa(60, 16, 7)}${chispa(88, 30, 4)}`,
  "corona-sencilla": `
    <path d="M30 78 l-4 -34 16 12 18 -22 18 22 16 -12 -4 34 z" ${T()}/>
    <circle cx="60" cy="66" r="3.5" fill="${GOLD}"/>`,
  "elefante-en-la-boa": `
    <path d="M14 82 c2 -26 14 -44 34 -46 c22 -2 40 10 48 30 c4 8 6 12 10 16" ${T()}/>
    <line x1="8" y1="82" x2="112" y2="82" ${T()}/>
    <path d="M40 62 c2 -10 10 -16 20 -16 c10 0 16 6 18 14 M74 66 c4 0 8 4 8 8 M46 54 c-4 6 -4 12 -2 18" ${T(INK, 1.6)} stroke-dasharray="2 4"/>
    <circle cx="52" cy="52" r="1.6" fill="${INK}"/>`,
  "el-farolero": `
    <circle cx="60" cy="86" r="22" ${T()}/>
    <path d="M56 70 v-26 M50 44 h12 M52 44 v-8 h8 v8" ${T(INK, 2.2)}/>
    ${chispa(56, 40, 6)}
    <path d="M74 60 c4 -6 10 -8 16 -6" ${T(ROSE, 2)}/>
    <circle cx="92" cy="52" r="3.5" ${T(ROSE, 2)}/>
    <path d="M89 58 c1 4 5 6 9 5 M92 56 v10 M88 72 l4 -6 4 6" ${T(ROSE, 2)}/>`,
  "el-rey": `
    <path d="M42 46 l-3 -18 10 7 11 -13 11 13 10 -7 -3 18 z" ${T()}/>
    <circle cx="60" cy="60" r="10" ${T()}/>
    <circle cx="56" cy="58" r="1.4" fill="${INK}"/>
    <circle cx="64" cy="58" r="1.4" fill="${INK}"/>
    <path d="M56 64 c2 2 6 2 8 0" ${T(INK, 1.8)}/>
    <path d="M40 96 c2 -16 10 -24 20 -24 c10 0 18 8 20 24" fill="${ROSE}" fill-opacity="0.2" stroke="${ROSE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M46 84 c4 2 8 2 12 0 M62 88 c4 2 8 2 12 0" ${T(ROSE, 1.6)} stroke-dasharray="1 5"/>`,
  "la-serpiente": `
    <path d="M18 78 c10 -12 22 -12 30 -2 c8 10 20 10 28 0 c8 -10 20 -12 28 -2" ${T(VERDE, 3)}/>
    <circle cx="20" cy="74" r="1.6" fill="${INK}"/>
    <path d="M14 78 c-3 1 -5 3 -6 6" ${T(VERDE, 2)}/>
    ${chispa(96, 52, 5)}`,
  "cordero-en-su-caja": `
    <rect x="34" y="52" width="52" height="36" rx="4" ${T()}/>
    <path d="M34 60 h52 M42 52 v36 M78 52 v36" ${T(INK, 1.4)} stroke-dasharray="2 6"/>
    <circle cx="48" cy="88" r="3" ${T(INK, 2)}/>
    <circle cx="72" cy="88" r="3" ${T(INK, 2)}/>
    <path d="M46 44 a8 8 0 0 1 12 -6 a8 8 0 0 1 14 2 a7 7 0 0 1 2 12 h-26 a7 7 0 0 1 -2 -8" fill="#fffdf8" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="70" cy="42" r="1.4" fill="${INK}"/>
    <path d="M74 52 h6" ${T(INK, 2)}/>`,
  "biplano-de-corazones": `
    <path d="M28 60 h44 c6 0 10 -3 10 -7 h-40" ${T()}/>
    <path d="M40 53 v-12 h24 v12 M40 46 h24" ${T(INK, 2.2)}/>
    <path d="M42 60 l-5 10 h8 l7 -10" ${T()}/>
    <path d="M24 50 c-3 2 -3 8 0 10" ${T(INK, 2)}/>
    <path d="M86 50 c4 -3 8 -3 10 0 c2 -3 6 -3 8 0 c1 4 -4 8 -9 11 c-5 -3 -10 -7 -9 -11 z" fill="${ROSE}" fill-opacity="0.5" stroke="${ROSE}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M78 56 c2 -1 4 -1 6 -2" ${T(ROSE, 1.8)} stroke-dasharray="1 5"/>`,
  "corazon-de-una-linea": `
    <path d="M24 66 C24 42 48 38 60 54 C72 38 96 42 96 66 C96 84 70 96 60 100 C50 96 24 84 24 66" ${T(ROSE)}/>
    ${chispa(90, 30, 6)}`,

  // ——— ORNAMENTOS decorativos (esquinas, divisores, cintas, marcos) ———
  "esquina-de-dos-arcos": `
    <path d="M16 98 C18 64 32 34 66 24" ${T(INK, 2.8)}/>
    <path d="M26 102 C30 72 44 44 76 34" ${T(ROSE, 2.2)} stroke-dasharray="1 7"/>
    ${chispa(88, 22, 7)}${chispa(20, 108, 4, ROSE)}`,
  "divisor-de-estrellas": `
    <path d="M8 62 C24 57 38 64 50 60" ${T(INK, 2.4)} stroke-dasharray="2 7"/>
    ${estrella(60, 58, 10)}
    <path d="M70 60 C84 55 98 63 112 58" ${T(INK, 2.4)} stroke-dasharray="2 7"/>
    ${chispa(12, 54, 4)}${chispa(108, 66, 4)}`,
  "banderin-de-feria": `
    <path d="M30 48 C46 57 74 57 90 48 L93 74 C74 83 46 83 27 74 Z" fill="${ROSE}" fill-opacity="0.18" stroke="${ROSE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 48 L13 43 l5 12 -7 10 16 9" ${T(ROSE, 2.2)}/>
    <path d="M90 48 L107 43 l-5 12 7 10 -16 9" ${T(ROSE, 2.2)}/>
    <path d="M40 64 c12 4 28 4 40 -1" ${T(INK, 1.8)} stroke-dasharray="1 6"/>
    ${chispa(60, 30, 5)}`,
  "marco-oval-tembloroso": `
    <path d="M60 16 C89 18 104 37 101 62 C98 87 82 104 57 102 C33 100 17 82 20 57 C23 33 35 14 60 16 Z" ${T(INK, 2.6)}/>
    <path d="M60 26 C82 28 94 42 92 60 C90 80 78 94 58 92 C38 90 28 78 30 60 C32 40 42 24 60 26 Z" ${T(GOLD, 1.8)} stroke-dasharray="1 6"/>`,
  "guirnalda-de-banderines": `
    <path d="M10 32 C40 52 80 52 110 32" ${T(INK, 2.2)}/>
    <path d="M18 37 l16 4 -8 16 z" fill="${ROSE}" fill-opacity="0.7" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M40 45 l16 2 -8 17 z" fill="${GOLD}" fill-opacity="0.7" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M62 47 l16 -1 -7 17 z" fill="${CORAL}" fill-opacity="0.7" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M84 43 l15 -4 -5 17 z" fill="${ROSE}" fill-opacity="0.7" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    ${chispa(60, 84, 5)}`,
  "subrayado-garabato": `
    <path d="M14 52 C34 46 62 49 106 44" ${T(INK, 3)}/>
    <path d="M18 66 C42 59 72 64 102 57" ${T(ROSE, 2.4)}/>
    <path d="M28 78 C50 73 68 76 94 70" ${T(INK, 2)} stroke-dasharray="1 6"/>`,
  "lazo-de-regalo": `
    <path d="M55 56 C36 40 23 42 21 54 C19 66 34 71 54 63" fill="${ROSE}" fill-opacity="0.2" stroke="${ROSE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M65 56 C84 40 97 42 99 54 C101 66 86 71 66 63" fill="${ROSE}" fill-opacity="0.2" stroke="${ROSE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M54 66 C48 78 44 88 37 98" ${T(ROSE, 2.4)}/>
    <path d="M66 66 C72 78 77 88 85 98" ${T(ROSE, 2.4)}/>
    <circle cx="60" cy="60" r="7" fill="${GOLD}" fill-opacity="0.55" stroke="${INK}" stroke-width="2.2"/>
    <path d="M32 52 c6 -3 12 -3 18 2 M88 52 c-6 -3 -12 -3 -18 2" ${T(INK, 1.4)} stroke-dasharray="1 5"/>`,
  "ramita-de-laurel": `
    <path d="M30 100 C42 78 54 54 84 24" ${T(VERDE, 2.6)}/>
    <path d="M42 78 c-11 -3 -18 1 -20 10 c9 4 17 -1 20 -10 z" fill="${VERDE}" fill-opacity="0.35" stroke="${VERDE}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M48 68 c4 -11 11 -15 20 -13 c0 10 -9 15 -20 13 z" fill="${VERDE}" fill-opacity="0.35" stroke="${VERDE}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M58 54 c-11 -2 -18 2 -19 11 c9 3 16 -2 19 -11 z" fill="${VERDE}" fill-opacity="0.35" stroke="${VERDE}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M66 44 c3 -11 10 -16 19 -14 c1 9 -8 15 -19 14 z" fill="${VERDE}" fill-opacity="0.35" stroke="${VERDE}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="88" cy="20" r="3.4" fill="${GOLD}"/>
    <circle cx="79" cy="30" r="2.6" fill="${GOLD}"/>`,
  "cinta-washi": `
    <g transform="rotate(-12 60 60)">
      <path d="M24 44 L96 44 L92 52 L98 60 L93 68 L96 76 L24 76 L28 68 L23 60 L28 52 Z" fill="${CORAL}" fill-opacity="0.3" stroke="${CORAL}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M40 44 L32 76 M56 44 L48 76 M72 44 L64 76 M88 44 L80 76" ${T(CORAL, 2)}/>
    </g>`,
  "nube-con-estrellas": `
    <path d="M30 76 a12 12 0 0 1 2 -24 a16 16 0 0 1 30 -9 a14 14 0 0 1 24 9 a11 11 0 0 1 2 24 z" ${T(INK, 2.6)}/>
    ${estrella(46, 60, 7)}${estrella(66, 54, 9)}${estrella(82, 64, 5)}
    ${chispa(24, 92, 5)}${chispa(96, 90, 4)}`,
  "flecha-con-rulos": `
    <path d="M14 78 C34 86 52 82 60 68 C66 57 58 48 50 54 C42 60 49 73 66 69 C82 65 93 53 101 41" ${T(INK, 2.8)}/>
    <path d="M91 43 L102 40 L99 51" ${T(INK, 2.8)}/>
    ${chispa(20, 66, 5, ROSE)}`,
  "sol-de-trazos": `
    <circle cx="60" cy="60" r="20" fill="${GOLD}" fill-opacity="0.3" stroke="${GOLD}" stroke-width="2.6"/>
    <path d="M60 30 c-2 -5 -1 -9 1 -14 M60 90 c2 5 1 9 -1 14 M30 60 c-5 -2 -9 -1 -14 1 M90 60 c5 2 9 1 14 -1" ${T(GOLD, 2.6)}/>
    <path d="M39 39 c-4 -3 -7 -6 -9 -11 M81 39 c4 -3 7 -6 9 -11 M39 81 c-4 3 -7 6 -9 11 M81 81 c4 3 7 6 9 11" ${T(GOLD, 2.4)}/>
    <path d="M48 55 C54 50 68 50 74 56" ${T(INK, 1.6)} stroke-dasharray="1 5"/>`,
  "media-corona-de-flores": `
    <path d="M18 74 C28 94 46 104 60 104 C74 104 92 94 102 74" ${T(VERDE, 2.4)}/>
    <path d="M34 90 c-8 -6 -14 -6 -18 -1 M86 90 c8 -6 14 -6 18 -1 M50 100 c-4 -8 -9 -11 -15 -10" ${T(VERDE, 2)}/>
    ${flor(26, 80, 7, ROSE)}${flor(60, 102, 8, CORAL)}${flor(94, 80, 7, ROSE)}
    ${chispa(60, 82, 5)}`,
};

// Detecta atributos duplicados en un elemento (XML inválido → sticker roto).
function tieneAtributoDuplicado(cuerpo) {
  for (const tag of cuerpo.match(/<[a-z]+[^>]*>/g) ?? []) {
    const attrs = (tag.match(/\s([a-zA-Z:-]+)=/g) ?? []).map((a) => a.trim().slice(0, -1));
    if (new Set(attrs).size !== attrs.length) return tag.slice(0, 60);
  }
  return null;
}

let n = 0;
for (const [nombre, cuerpo] of Object.entries(stickers)) {
  n++;
  const dup = tieneAtributoDuplicado(cuerpo);
  if (dup) {
    console.error(`✗ ${nombre}: atributo duplicado en ${dup}…`);
    process.exit(1);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">\n${cuerpo}\n</svg>\n`;
  writeFileSync(path.join(carpeta, `${String(n).padStart(2, "0")}-${nombre}.svg`), svg);
}
console.log(`Generados ${n} stickers SVG en ${carpeta}`);
