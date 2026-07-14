import { nanoid } from "nanoid";
import type { CanvasElement, ImageElement, TextElement } from "@/lib/types/canvas";

export const FONT_OPTIONS = [
  { label: "Manuscrita", value: "var(--font-hand)" },
  { label: "Serif", value: "var(--font-serif)" },
  { label: "Redonda", value: "var(--font-sans)" },
] as const;

export function maxZ(elements: CanvasElement[]): number {
  return elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
}

export function newTextElement(elements: CanvasElement[]): TextElement {
  return {
    id: nanoid(8),
    kind: "text",
    text: "Escribe aquí…",
    x: 50,
    y: 50,
    width: 60,
    height: 12,
    rotation: 0,
    zIndex: maxZ(elements) + 1,
    fontSize: 6,
    fontFamily: "var(--font-hand)",
    color: "#3a2e26",
    align: "center",
  };
}

export function newImageElement(
  elements: CanvasElement[],
  src: string,
  naturalWidth: number | null,
  naturalHeight: number | null
): ImageElement {
  const ratio =
    naturalWidth && naturalHeight ? naturalHeight / naturalWidth : 1;
  return {
    id: nanoid(8),
    kind: "image",
    src,
    ratio,
    x: 50,
    y: 50,
    width: 40,
    rotation: 0,
    zIndex: maxZ(elements) + 1,
  };
}
