// Utilidades de color para los sobres del álbum.

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full || "d6c7a1", 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

/** Oscurece/aclara un color hex por un porcentaje (-100..100). */
export function shade(hex: string, percent: number): string {
  const [r0, g0, b0] = toRgb(hex);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, r0 + amt));
  const g = Math.max(0, Math.min(255, g0 + amt));
  const b = Math.max(0, Math.min(255, b0 + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Devuelve una tinta legible (oscura o clara) según la luminancia del fondo. */
export function readableInk(hex: string): string {
  const [r, g, b] = toRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#3a2e26" : "#fbf3e4";
}
