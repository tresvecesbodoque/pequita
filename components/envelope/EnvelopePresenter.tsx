"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { motion, useAnimate } from "framer-motion";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { FoldedLetter } from "./FoldedLetter";
import { backgroundLayerStyle, type BackgroundConfig } from "@/lib/backgrounds/render";
import { parseCanvas, EMPTY_ESQUELA, EMPTY_SOBRE } from "@/lib/types/canvas";

type Props = {
  title: string;
  esquelaCanvas: string;
  sobreCanvas: string;
  sobreColor: string | null;
  sobreBaseImageUrl: string | null;
  esquelaBaseImageUrl: string | null;
  background: BackgroundConfig;
  qrInterior: string | null;
};

export function EnvelopePresenter({
  title,
  esquelaCanvas,
  sobreCanvas,
  sobreColor,
  sobreBaseImageUrl,
  esquelaBaseImageUrl,
  background,
  qrInterior,
}: Props) {
  const esquela = parseCanvas(esquelaCanvas, EMPTY_ESQUELA);
  const sobre = parseCanvas(sobreCanvas, EMPTY_SOBRE);

  const [scope, animate] = useAnimate();
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);

  async function open() {
    if (opened || busy) return;
    setBusy(true);

    const paper = [0.22, 1, 0.36, 1] as const;

    // Fase 1: la solapa del sobre se abre de a poco, con sensación de papel:
    // primero cede un poco, luego gira hasta abrirse con un leve rebote final.
    await animate(
      ".flap",
      { rotateX: [0, -14, -186, -172] },
      { duration: 1.5, ease: paper, times: [0, 0.28, 0.85, 1] }
    );

    // Fase 2: el sobre se desliza hacia abajo y se desvanece mientras la
    // esquela (doblada) emerge hacia el centro.
    animate(".envelope", { y: 120, opacity: 0, scale: 0.94 }, { duration: 1.0, ease: "easeInOut" });
    await animate(
      ".letter",
      { opacity: 1, y: 0, scale: 1 },
      { duration: 1.1, ease: paper, delay: 0.25 }
    );

    // Fase 3: la esquela se despliega con el mismo efecto smooth de papel.
    await animate(
      ".fold-flap",
      { rotateX: [-180, -168, 6, 0] },
      { duration: 1.5, ease: paper, times: [0, 0.18, 0.86, 1], delay: 0.2 }
    );

    setOpened(true);
    setBusy(false);
  }

  function reset() {
    setOpened(false);
    animate(".flap", { rotateX: 0 }, { duration: 0.01 });
    animate(".envelope", { y: 0, opacity: 1, scale: 1 }, { duration: 0.01 });
    animate(".letter", { opacity: 0, y: 50, scale: 0.92 }, { duration: 0.01 });
    animate(".fold-flap", { rotateX: -180 }, { duration: 0.01 });
  }

  const flapColor = shade(sobreColor ?? "#d6c7a1", -18);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={backgroundLayerStyle(background)}
    >
      {/* velo suave para dar profundidad al fondo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />

      <div ref={scope} className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <div
          className="relative flex w-full items-center justify-center"
          style={{ perspective: 1600, minHeight: "60vh" }}
        >
          {/* ESQUELA (carta) — emerge al abrir */}
          <motion.div
            className="letter absolute w-[80%] max-w-sm"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            style={{ zIndex: 5 }}
          >
            <FoldedLetter data={esquela} baseImageUrl={esquelaBaseImageUrl} />
            {qrInterior && opened && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-[var(--surface)]/80 p-3 backdrop-blur"
              >
                <img src={qrInterior} alt="QR" className="h-16 w-16" />
                <span className="text-xs text-[var(--muted)]">
                  Escanéame para volver a esta carta
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* SOBRE cerrado */}
          <motion.div className="envelope relative w-full" style={{ zIndex: 10 }}>
            <div className="relative w-full" style={{ transformStyle: "preserve-3d" }}>
              {/* cara del sobre = diseño del sobre */}
              <div className="overflow-hidden rounded-md shadow-[0_25px_70px_-25px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
                <CanvasStage
                  data={sobre}
                  baseColor={sobreColor}
                  baseImageUrl={sobreBaseImageUrl}
                />
              </div>

              {/* solapa triangular superior (se abre) */}
              <div
                className="flap absolute inset-x-0 top-0"
                style={{
                  height: "58%",
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: `linear-gradient(180deg, ${flapColor}, ${shade(flapColor, -6)})`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  zIndex: 4,
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Controles */}
        <div className="relative z-20 mt-2 text-center">
          {!opened ? (
            <motion.button
              onClick={open}
              disabled={busy}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
              className="rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Toca para abrir ✉
            </motion.button>
          ) : (
            <button
              onClick={reset}
              className="rounded-full border border-white/40 bg-white/30 px-5 py-2 text-xs text-[var(--foreground)] backdrop-blur hover:bg-white/50"
            >
              Volver a cerrar
            </button>
          )}
        </div>

        <p className="relative z-20 mt-6 text-center text-sm text-[var(--foreground)]/70">
          {title}
        </p>
      </div>
    </div>
  );
}

/** Oscurece/aclara un color hex por un porcentaje (-100..100). */
function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
