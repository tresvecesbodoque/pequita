// Metadatos de los tipos de sticker, seguros para importar desde el cliente.
export const STICKER_TYPES = [
  { value: "ESQUELA", label: "Esquela", category: "esquelas", hint: "Fondo/base para el interior de la carta" },
  { value: "DECORATIVO", label: "Decorativo", category: "decorativos", hint: "Flores, sellos, adornos con transparencia" },
  { value: "FOTO", label: "Foto", category: "fotos", hint: "Fotos personales" },
  { value: "ESCANEO", label: "Escaneo", category: "escaneos", hint: "Fotos de cartas o esquelas físicas" },
] as const;

export type StickerTypeValue = (typeof STICKER_TYPES)[number]["value"];

export function categoryForType(type: StickerTypeValue): string {
  return STICKER_TYPES.find((t) => t.value === type)?.category ?? "decorativos";
}
