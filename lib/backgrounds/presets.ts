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
