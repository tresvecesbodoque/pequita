"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { motion, useAnimate } from "framer-motion";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { FoldedLetter } from "./FoldedLetter";
import { backgroundLayerStyle, type BackgroundConfig } from "@/lib/backgrounds/render";
import { parseCanvas, EMPTY_ESQUELA, EMPTY_SOBRE } from "@/lib/types/canvas";
import { shade } from "@/lib/color";

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

// Secuencia de apertura, como una carta de verdad:
//  1. El sello cede y la solapa del sobre se abre hacia atrás.
//  2. La hoja DOBLADA sale deslizándose desde dentro del sobre (estaba
//     escondida detrás de la cara frontal; al subir, emerge por la boca).
//  3. El sobre se retira hacia abajo mientras la hoja viaja al centro.
//  4. La hoja se despliega por su pliegue y el mensaje queda a la vista,
//     impreso en el papel. Sin fundidos cruzados ni textos superpuestos.
const PAPER_EASE = [0.22, 1, 0.36, 1] as const;

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
  // Remontar el escenario es la forma más fiable de "volver a cerrar".
  const [sceneKey, setSceneKey] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  async function open() {
    if (opened || busy) return;
    setBusy(true);

    const stage = stageRef.current!.getBoundingClientRect();
    const env = envelopeRef.current!.getBoundingClientRect();
    const letter = letterRef.current!.getBoundingClientRect();

    // 1) El sello se suelta y la solapa se abre con inercia de papel.
    // No la giramos 180° completos: pasado el punto muerto la proyección CSS
    // la muestra espejada sobre el sobre (dos triángulos flotantes). En vez de
    // eso, gira hasta ~150° y se desvanece: el sobre queda como bolsillo
    // abierto y la hoja sale limpia.
    animate(".seal", { opacity: 0, scale: 0.5 }, { duration: 0.4, ease: "easeOut" });
    await animate(
      ".flap",
      { rotateX: [0, -12, -105] },
      { duration: 0.8, ease: "easeIn", times: [0, 0.3, 1] }
    );
    await animate(
      ".flap",
      { rotateX: -150, opacity: 0 },
      { duration: 0.4, ease: "easeOut" }
    );

    // 2) La hoja doblada emerge desde dentro del sobre (queda apenas apoyada
    // en la boca, para no salirse de pantalla en móviles).
    const dyOut = env.top - letter.bottom + Math.min(28, letter.height * 0.12);
    await animate(".letter", { y: dyOut }, { duration: 1.2, ease: PAPER_EASE });

    // 3) El sobre se despide hacia abajo; la hoja viaja al centro del escenario.
    animate(
      ".env-piece",
      { y: 110, opacity: 0 },
      { duration: 0.85, ease: "easeInOut" }
    );
    // Al desplegarse, la hoja completa queda centrada en la línea de pliegue
    // (el borde superior del paquete), así que llevamos ese borde al centro.
    const dyCenter = stage.top + stage.height / 2 - letter.top;
    await animate(
      ".letter",
      { y: dyCenter, scale: 1.06 },
      { duration: 0.95, ease: PAPER_EASE }
    );

    // 4) La hoja se despliega por el pliegue, con un respiro final de papel.
    await animate(
      ".fold-flap",
      { rotateX: [-180, 4, 0] },
      { duration: 1.35, ease: PAPER_EASE, times: [0, 0.82, 1] }
    );

    setOpened(true);
    setBusy(false);
  }

  function reset() {
    setOpened(false);
    setBusy(false);
    setSceneKey((k) => k + 1);
  }

  const envColor = sobreColor ?? "#e7d8b5";
  const flapColor = shade(envColor, -14);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-14"
      style={backgroundLayerStyle(background)}
    >
      {/* velo suave para dar profundidad al fondo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />

      <div
        key={sceneKey}
        ref={scope}
        className="relative z-10 flex w-full max-w-lg flex-col items-center"
      >
        <div
          ref={stageRef}
          className="relative flex w-full items-center justify-center"
          style={{ perspective: 1600, minHeight: "68vh" }}
        >
          {/* SOBRE (contenedor transparente: sus piezas se animan por separado
              para que la hoja, que vive dentro, no se desvanezca con él) */}
          <motion.div
            ref={envelopeRef}
            className="envelope relative w-full max-w-md"
            style={{ perspective: 1300 }}
          >
            {/* Cara frontal del sobre: el diseño hecho en el taller */}
            <motion.div className="env-piece relative" style={{ zIndex: 4 }}>
              <div className="overflow-hidden rounded-lg shadow-[0_30px_70px_-28px_rgba(16,27,54,0.6)] ring-1 ring-black/10">
                <CanvasStage
                  data={sobre}
                  baseColor={envColor}
                  baseImageUrl={sobreBaseImageUrl}
                />
              </div>
            </motion.div>

            {/* HOJA doblada: escondida detrás de la cara frontal.
                Al deslizarse hacia arriba emerge por la boca del sobre. */}
            <motion.div
              ref={letterRef}
              className="letter absolute inset-x-[8%] bottom-[7%]"
              style={{ zIndex: 3, transformOrigin: "top center" }}
            >
              <FoldedLetter data={esquela} baseImageUrl={esquelaBaseImageUrl} />
              {qrInterior && opened && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6, ease: PAPER_EASE }}
                  className="mx-auto mt-4 flex w-fit items-center justify-center gap-3 rounded-xl bg-[var(--surface)]/85 px-4 py-3 shadow-sm backdrop-blur"
                >
                  <img src={qrInterior} alt="QR" className="h-14 w-14" />
                  <span className="text-xs text-[var(--muted)]">
                    Escanéame para volver a esta carta
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Solapa triangular: cerrada tapa la boca; al abrirse gira hacia
                atrás y deja pasar la hoja por delante. */}
            <motion.div
              className="flap env-piece absolute inset-x-0 top-0"
              style={{
                height: "56%",
                zIndex: 30,
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: `linear-gradient(180deg, ${flapColor}, ${shade(flapColor, -7)})`,
                  filter: "drop-shadow(0 3px 5px rgba(16,27,54,0.18))",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
              {/* dorso de la solapa: interior del sobre (se entrevé al girar) */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: shade(flapColor, -18),
                  transform: "rotateX(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
            </motion.div>

            {/* Sello: una estrella dorada en la punta de la solapa */}
            <motion.div
              className="seal env-piece pointer-events-none absolute"
              style={{
                zIndex: 31,
                left: "calc(50% - 20px)",
                top: "calc(56% - 20px)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/10"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${shade("#d9a83f", 18)}, #d9a83f 60%, ${shade("#d9a83f", -16)})`,
                  boxShadow: "0 4px 10px rgba(16,27,54,0.25)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path
                    d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
                    fill="#fffdf8"
                    fillOpacity="0.92"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Controles */}
        <div className="relative z-20 mt-3 text-center">
          {!opened ? (
            <motion.button
              onClick={open}
              disabled={busy}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={busy ? { y: 0 } : { y: [0, -4, 0] }}
              transition={{ y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } }}
              className="rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-[var(--night-ink,#f2ecdd)] shadow-lg disabled:opacity-0"
            >
              Toca para abrir ✉
            </motion.button>
          ) : (
            <button
              onClick={reset}
              className="rounded-full border border-white/40 bg-white/30 px-5 py-2 text-xs text-[var(--foreground)] backdrop-blur transition-colors hover:bg-white/50"
            >
              Volver a cerrar
            </button>
          )}
        </div>

        <p className="relative z-20 mt-5 text-center text-sm text-[var(--foreground)]/70">
          {title}
        </p>
      </div>
    </div>
  );
}
