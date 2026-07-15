import { nanoid } from "nanoid";
import type { CanvasData, CanvasElement, ImageElement, TextElement } from "@/lib/types/canvas";

// Construye el lienzo de la esquela (y del sobre) a partir de lo que escribe un
// familiar en la página pública. El objetivo es que SIEMPRE se vea bien y que un
// mensaje largo nunca se recorte (el overflow del lienzo está oculto), sin pedir
// al familiar que ajuste nada.

const CANVAS_W = 1000;
const CANVAS_H = 1400;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// Estima un fontSize (% del alto del lienzo) que haga caber `len` caracteres en
// una caja de `widthPct` × `heightPct`, con margen de seguridad.
function fitFontSize(len: number, widthPct: number, heightPct: number): number {
  const wpx = (widthPct / 100) * CANVAS_W;
  const hpx = (heightPct / 100) * CANVAS_H;
  const charAspect = 0.5; // ancho medio de carácter / tamaño de fuente
  const lineHeight = 1.35;
  const safety = 0.8; // margen para variaciones de fuente y saltos de línea
  const fsPx = Math.sqrt((wpx * hpx) / (lineHeight * charAspect * Math.max(len, 1))) * safety;
  return Number(clamp((fsPx / CANVAS_H) * 100, 2.0, 6.5).toFixed(2));
}

export function buildGuestEsquela(opts: {
  message: string;
  authorName: string;
  fontFamily: string;
  ink: string;
  photoUrl: string | null;
  photoRatio: number;
  /** firma a mano alzada (data URL PNG apaisado ~400×140) */
  signatureUrl?: string | null;
}): CanvasData {
  const { message, authorName, fontFamily, ink, photoUrl, photoRatio, signatureUrl } = opts;
  const text = `${message}\n\n— ${authorName}`;
  const len = text.length;
  const elements: CanvasElement[] = [];
  let z = 1;

  if (photoUrl) {
    // Foto arriba, dimensionada por su ALTURA objetivo (~26% del lienzo) para que
    // retratos y panorámicas ocupen un espacio parecido y no desborden.
    const ratio = clamp(photoRatio, 0.4, 2.2);
    const targetHpx = 360;
    const widthPct = clamp(((targetHpx / ratio) / CANVAS_W) * 100, 20, 46);
    const photoHpct = ((widthPct / 100) * CANVAS_W * ratio) / CANVAS_H * 100;
    const photoY = 7 + photoHpct / 2;
    elements.push({
      id: nanoid(8),
      kind: "image",
      src: photoUrl,
      ratio,
      x: 50,
      y: photoY,
      width: widthPct,
      rotation: 0,
      zIndex: z++,
    } as ImageElement);

    const textTop = photoY + photoHpct / 2 + 4;
    const textBottom = signatureUrl ? 86 : 93;
    const heightPct = textBottom - textTop;
    elements.push({
      id: nanoid(8),
      kind: "text",
      text,
      x: 50,
      y: (textTop + textBottom) / 2,
      width: 82,
      height: heightPct,
      rotation: 0,
      zIndex: z++,
      fontSize: fitFontSize(len, 82, heightPct),
      fontFamily,
      color: ink,
      align: len <= 160 ? "center" : "left",
    } as TextElement);
  } else {
    const height = signatureUrl ? 74 : 84;
    elements.push({
      id: nanoid(8),
      kind: "text",
      text,
      x: 50,
      y: signatureUrl ? 45 : 50,
      width: 82,
      height,
      rotation: 0,
      zIndex: z++,
      fontSize: fitFontSize(len, 82, height),
      fontFamily,
      color: ink,
      align: len <= 200 ? "center" : "left",
    } as TextElement);
  }

  if (signatureUrl) {
    // Firma a mano alzada abajo a la derecha, ligeramente traviesa.
    const ratio = 140 / 400;
    elements.push({
      id: nanoid(8),
      kind: "image",
      src: signatureUrl,
      ratio,
      x: 66,
      y: 91,
      width: 30,
      rotation: -2,
      zIndex: z++,
    } as ImageElement);
  }

  return { elements, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H };
}

export function buildGuestSobre(opts: { ink: string }): CanvasData {
  return {
    elements: [
      {
        id: nanoid(8),
        kind: "text",
        text: "Para ti",
        x: 50,
        y: 72, // por debajo de la solapa triangular del sobre
        width: 70,
        height: 16,
        rotation: 0,
        zIndex: 1,
        fontSize: 6.5,
        fontFamily: "var(--font-serif)",
        color: opts.ink,
        align: "center",
      } as TextElement,
    ],
    canvasWidth: 1400,
    canvasHeight: 900,
  };
}
