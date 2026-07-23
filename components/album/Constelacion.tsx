"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { leerLeidas } from "./MarcarLeida";

// La constelación del álbum: una estrella por carta, encendida si esa carta
// ya se leyó en este dispositivo. Al completarlas todas, las estrellas se
// conectan con trazo de lápiz y aparece un mensaje final oculto.

type Props = {
  slugs: string[];
  /** mensaje que se revela al leer todas las cartas */
  mensajeFinal: string;
};

// Las estrellas trazan un "23" (los años de Isidora). Nodos en orden de trazo
// dentro del lienzo (viewBox 100×44); `d` es el dígito (0 = "2", 1 = "3"), para
// unir cada número con su propia línea al completarse la constelación.
const NODOS_23: { x: number; y: number; d: 0 | 1 }[] = [
  // "2": arco superior → diagonal → base
  { x: 20, y: 13, d: 0 }, { x: 26, y: 7, d: 0 }, { x: 34, y: 6, d: 0 },
  { x: 41, y: 9, d: 0 }, { x: 43, y: 15, d: 0 }, { x: 39, y: 21, d: 0 },
  { x: 32, y: 27, d: 0 }, { x: 25, y: 32, d: 0 }, { x: 19, y: 37, d: 0 },
  { x: 27, y: 38, d: 0 }, { x: 35, y: 38, d: 0 }, { x: 44, y: 38, d: 0 },
  // "3": lóbulo superior → cintura → lóbulo inferior
  { x: 58, y: 9, d: 1 }, { x: 66, y: 6, d: 1 }, { x: 74, y: 7, d: 1 },
  { x: 80, y: 13, d: 1 }, { x: 75, y: 19, d: 1 }, { x: 67, y: 22, d: 1 },
  { x: 76, y: 26, d: 1 }, { x: 81, y: 32, d: 1 }, { x: 74, y: 37, d: 1 },
  { x: 65, y: 38, d: 1 }, { x: 58, y: 34, d: 1 },
];

// Reparte las `total` estrellas a lo largo de los nodos del "23", encajando cada
// carta en un nodo real (sin caer en el hueco entre los dos dígitos). Con ~23
// cartas el número se completa; con menos, se insinúa y se va formando.
function nodoPara(i: number, total: number) {
  if (total <= 1) return NODOS_23[0];
  const idx = Math.round((i * (NODOS_23.length - 1)) / (total - 1));
  return NODOS_23[Math.min(idx, NODOS_23.length - 1)];
}

export function Constelacion({ slugs, mensajeFinal }: Props) {
  const [leidas, setLeidas] = useState<string[] | null>(null);

  useEffect(() => {
    setLeidas(leerLeidas());
  }, []);

  if (leidas === null || slugs.length === 0) return null;

  const encendidas = slugs.filter((s) => leidas.includes(s));
  const completa = encendidas.length === slugs.length;
  const puntos = slugs.map((s, i) => ({
    slug: s,
    ...nodoPara(i, slugs.length),
    on: leidas.includes(s),
  }));
  // Al completarse, cada dígito se une con su propia línea (no se cruza el hueco).
  const lineaDigito = (d: 0 | 1) =>
    puntos.filter((p) => p.d === d).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative z-10 mx-auto mt-8 w-full max-w-lg px-4">
      <svg viewBox="0 0 100 44" className="w-full" aria-hidden>
        {/* al completarse, cada dígito del "23" se traza como constelación */}
        {completa &&
          ([0, 1] as const).map((d) => (
            <motion.polyline
              key={d}
              points={lineaDigito(d)}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="0.5"
              strokeDasharray="1.5 1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: d * 0.3 }}
            />
          ))}
        {puntos.map((p) => (
          <g key={p.slug}>
            {p.on && (
              <circle cx={p.x} cy={p.y} r="2.6" fill="var(--gold)" opacity="0.25" />
            )}
            <path
              d={`M${p.x} ${p.y - 1.8} l0.55 1.25 1.25 0.55 -1.25 0.55 -0.55 1.25 -0.55 -1.25 -1.25 -0.55 1.25 -0.55 z`}
              fill={p.on ? "var(--gold)" : "none"}
              stroke={p.on ? "var(--gold)" : "var(--night-ink)"}
              strokeOpacity={p.on ? 1 : 0.4}
              strokeWidth="0.35"
            />
          </g>
        ))}
      </svg>

      <p className="mt-2 text-center text-xs tracking-wide text-[var(--night-ink)]/65">
        {completa
          ? "Has encendido todas las estrellas ✨"
          : `${encendidas.length} de ${slugs.length} estrellas encendidas — cada carta leída enciende una`}
      </p>

      {completa && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="sketch-card sketch-card--gira mx-auto mt-5 max-w-md p-5 text-center"
        >
          <svg viewBox="0 0 24 24" className="mx-auto h-7 w-7" aria-hidden>
            <path
              d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
              fill="var(--gold)"
              stroke="var(--foreground)"
              strokeWidth="1.2"
            />
          </svg>
          <p
            className="mt-2 text-lg leading-relaxed text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-hand)" }}
          >
            {mensajeFinal}
          </p>
        </motion.div>
      )}
    </div>
  );
}
