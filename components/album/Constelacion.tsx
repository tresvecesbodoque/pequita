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

// Posición determinista de cada estrella dentro del lienzo (0..100),
// derivada del slug para que no cambie entre visitas.
function posicion(slug: string, i: number, total: number) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const x = 8 + (i + 0.5) * (84 / total) + ((h % 7) - 3);
  const y = 22 + ((h >> 3) % 46);
  return { x: Math.max(5, Math.min(95, x)), y };
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
    ...posicion(s, i, slugs.length),
    on: leidas.includes(s),
  }));

  return (
    <div className="relative z-10 mx-auto mt-10 w-full max-w-xl px-4">
      <svg viewBox="0 0 100 70" className="w-full" aria-hidden>
        {/* al completarse, el trazo une las estrellas como constelación */}
        {completa && (
          <motion.polyline
            points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        )}
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
