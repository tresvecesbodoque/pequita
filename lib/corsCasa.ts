// Los sitios de casa hablan con la app desde otro dominio (el contador es
// estático y vive aparte), así que sus endpoints necesitan CORS. En
// desarrollo, cualquier localhost.
const CASAS = ["https://misiete.vercel.app", "https://dossieteshastaelsiete.vercel.app"];
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function cabecerasCasa(origen: string | null) {
  const permitido = origen && (CASAS.includes(origen) || LOCAL.test(origen)) ? origen : CASAS[0];
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}

export const QUIENES = ["zorro", "rosa"] as const;
export type Quien = (typeof QUIENES)[number];
export const OTRO: Record<Quien, Quien> = { zorro: "rosa", rosa: "zorro" };
export const esQuien = (x: unknown): x is Quien =>
  typeof x === "string" && (QUIENES as readonly string[]).includes(x);
