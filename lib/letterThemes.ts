// Temas visuales que un familiar puede elegir al escribir su carta. Cada tema
// mapea a un fondo del presentador (preset) + color de sobre + tintas.
//
// Ojo: la esquela (el papel interior) SIEMPRE se dibuja sobre papel crema, así
// que `ink` (tinta del mensaje) debe ser oscura y legible sobre crema. `sobreInk`
// es la tinta del texto del sobre, que sí contrasta con `sobreColor`.

export type LetterTheme = {
  id: string;
  name: string;
  /** id de preset en lib/backgrounds/presets.ts */
  presetId: string;
  /** color del sobre */
  sobreColor: string;
  /** tinta del mensaje (oscura, va sobre papel crema) */
  ink: string;
  /** tinta del texto del sobre (contrasta con sobreColor) */
  sobreInk: string;
  /** emoji para la ficha del selector */
  emoji: string;
};

export const LETTER_THEMES: LetterTheme[] = [
  {
    id: "crema",
    name: "Pergamino",
    presetId: "liso-crema",
    sobreColor: "#e7d8b5",
    ink: "#4a3b2e",
    sobreInk: "#4a3b2e",
    emoji: "📜",
  },
  {
    id: "corazones",
    name: "Corazones",
    presetId: "corazones",
    sobreColor: "#e9b9c2",
    ink: "#7d2740",
    sobreInk: "#7d2740",
    emoji: "💗",
  },
  {
    id: "estrellas",
    name: "Noche estrellada",
    presetId: "estrellas",
    sobreColor: "#2c3454",
    ink: "#2c3454",
    sobreInk: "#f3e6c0",
    emoji: "✨",
  },
  {
    id: "puntos",
    name: "Dorado",
    presetId: "puntos",
    sobreColor: "#e6d3a6",
    ink: "#5a4522",
    sobreInk: "#5a4522",
    emoji: "🌼",
  },
  {
    id: "zorro",
    name: "El zorro",
    presetId: "zorro",
    sobreColor: "#e8b88a",
    ink: "#7a4a21",
    sobreInk: "#7a4a21",
    emoji: "🦊",
  },
  {
    id: "aviador",
    name: "Cielo de aviador",
    presetId: "nubes",
    sobreColor: "#c9d8e8",
    ink: "#35506b",
    sobreInk: "#35506b",
    emoji: "✈️",
  },
  {
    id: "botanico",
    name: "Botánico",
    presetId: "botanico",
    sobreColor: "#cdd7be",
    ink: "#3f5137",
    sobreInk: "#3f5137",
    emoji: "🌿",
  },
];

export function getTheme(id: string | null | undefined): LetterTheme {
  return LETTER_THEMES.find((t) => t.id === id) ?? LETTER_THEMES[0];
}

/** Emoji de estampilla según el preset de fondo que guardó la carta. */
export function stampEmojiForPreset(presetId: string | null | undefined): string {
  const t = LETTER_THEMES.find((x) => x.presetId === presetId);
  return t?.emoji ?? "⭐";
}
