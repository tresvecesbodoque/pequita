// Temas de fondo predefinidos para el presentador. Cada patrón es un SVG
// tileable embebido como data URI, así no dependemos de archivos externos.
// El usuario también puede subir su propio PNG "motivo" (ej. El Principito).

export type BackgroundPreset = {
  id: string;
  name: string;
  bgColor: string;
  /** SVG del tile (se repite). Si es null, es un fondo liso. */
  tileSvg: string | null;
  /** tamaño natural del tile en px */
  tileSize: number;
};

function tile(size: number, inner: string): string {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${inner}</svg>`;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "liso-crema",
    name: "Liso crema",
    bgColor: "#f6f1e7",
    tileSvg: null,
    tileSize: 40,
  },
  {
    id: "corazones",
    name: "Corazones",
    bgColor: "#f7ece9",
    tileSize: 44,
    tileSvg: tile(
      44,
      `<path d='M22 30c-6-5-11-9-11-15a5.5 5.5 0 0 1 11-2 5.5 5.5 0 0 1 11 2c0 6-5 10-11 15z' fill='#d98a99' fill-opacity='0.55'/>`
    ),
  },
  {
    id: "estrellas",
    name: "Estrellas nocturnas",
    bgColor: "#20293f",
    tileSize: 48,
    tileSvg: tile(
      48,
      `<g fill='#e6c86b' fill-opacity='0.75'><circle cx='10' cy='12' r='1.4'/><circle cx='34' cy='8' r='1'/><circle cx='24' cy='26' r='1.8'/><circle cx='40' cy='34' r='1.2'/><circle cx='8' cy='38' r='1'/><path d='M24 20l1.2 3 3 1.2-3 1.2L24 30l-1.2-3-3-1.2 3-1.2z'/></g>`
    ),
  },
  {
    id: "puntos",
    name: "Puntos",
    bgColor: "#fbf7ef",
    tileSize: 28,
    tileSvg: tile(
      28,
      `<circle cx='14' cy='14' r='2.4' fill='#b08d43' fill-opacity='0.35'/>`
    ),
  },
  {
    id: "zorro",
    name: "El zorro",
    bgColor: "#f8ece1",
    tileSize: 56,
    tileSvg: tile(
      56,
      `<g fill='none' stroke='#c97b4a' stroke-opacity='0.55' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><path d='M20 22l4-6 4 5h4l4-5 4 6c0 7-4 11-10 11s-10-4-10-11z'/><path d='M27 29h6'/></g><circle cx='12' cy='44' r='1.3' fill='#c97b4a' fill-opacity='0.4'/><circle cx='46' cy='46' r='1' fill='#c97b4a' fill-opacity='0.4'/>`
    ),
  },
  {
    id: "nubes",
    name: "Cielo de aviador",
    bgColor: "#eef3f8",
    tileSize: 64,
    tileSvg: tile(
      64,
      `<g fill='none' stroke='#7d9cbb' stroke-opacity='0.5' stroke-width='1.4' stroke-linecap='round'><path d='M12 22c2-5 9-5 11 0h5a4 4 0 0 1 0 8H14a4 4 0 0 1-2-8z'/><path d='M38 48c1-3 6-3 7 0h4a3 3 0 0 1 0 6H37a3 3 0 0 1 1-6z'/></g><path d='M50 14l1.4 3.4 3.4 1.4-3.4 1.4L50 23.6l-1.4-3.4-3.4-1.4 3.4-1.4z' fill='#d9a83f' fill-opacity='0.55'/>`
    ),
  },
  {
    id: "botanico",
    name: "Botánico",
    bgColor: "#eef1e8",
    tileSize: 56,
    tileSvg: tile(
      56,
      `<g fill='none' stroke='#5a6b52' stroke-opacity='0.5' stroke-width='1.4' stroke-linecap='round'><path d='M28 46c0-10 6-16 12-20'/><path d='M34 34c3 1 6 0 8-2'/><path d='M32 40c3 1 6 1 9-1'/><path d='M28 46c0-10-6-16-12-20'/><path d='M22 34c-3 1-6 0-8-2'/></g>`
    ),
  },
];

export function getPreset(id: string | null | undefined): BackgroundPreset {
  return BACKGROUND_PRESETS.find((p) => p.id === id) ?? BACKGROUND_PRESETS[0];
}
