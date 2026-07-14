// Modelo del "lienzo" libre usado tanto en la esquela como en el sobre.
// Las posiciones y tamaños se guardan en PORCENTAJE (0-100) relativo al lienzo,
// para que el mismo diseño se vea idéntico en el editor y en el presentador,
// sin importar el tamaño real en pantalla.

export type CanvasElementBase = {
  id: string;
  x: number; // % desde la izquierda (centro del elemento)
  y: number; // % desde arriba (centro del elemento)
  width: number; // % del ancho del lienzo
  rotation: number; // grados
  zIndex: number;
  hidden?: boolean; // capa oculta (no se muestra en el presentador)
};

export type ImageElement = CanvasElementBase & {
  kind: "image";
  src: string; // ruta a /uploads/... o dataURL (ej. un QR)
  /** proporción alto/ancho de la imagen original, para calcular la altura */
  ratio: number;
};

export type TextElement = CanvasElementBase & {
  kind: "text";
  text: string;
  height: number; // % del alto del lienzo (la caja de texto)
  fontSize: number; // % del alto del lienzo de referencia
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right" | "justify";
  fontStyle?: "normal" | "italic";
  fontWeight?: number;
};

export type CanvasElement = ImageElement | TextElement;

export interface CanvasData {
  elements: CanvasElement[];
  canvasWidth: number; // dimensión de diseño de referencia
  canvasHeight: number;
}

export const EMPTY_ESQUELA: CanvasData = {
  elements: [],
  canvasWidth: 1000,
  canvasHeight: 1400,
};

export const EMPTY_SOBRE: CanvasData = {
  elements: [],
  canvasWidth: 1400,
  canvasHeight: 900,
};

/** Parseo defensivo: si el JSON está corrupto, devuelve un lienzo vacío. */
export function parseCanvas(json: string | null | undefined, fallback: CanvasData): CanvasData {
  if (!json) return fallback;
  try {
    const data = JSON.parse(json) as CanvasData;
    if (!Array.isArray(data.elements)) return fallback;
    return data;
  } catch {
    return fallback;
  }
}
