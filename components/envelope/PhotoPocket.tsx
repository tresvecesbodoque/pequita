"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { shade } from "@/lib/color";
import { playSobrecito } from "@/lib/paperSound";

// El sobrecito de las fotos.
//
// Las fotos que manda un familiar ya no se pegan sobre la hoja escrita (allí
// competían con el mensaje y encogían la letra): viajan en su PROPIO sobre,
// pequeño, junto a la carta. Se abre aparte, cuando ella quiera, y las fotos
// salen en abanico como copias reveladas.

export type PocketPhoto = { url: string; ratio: number };

const PAPER_EASE = [0.22, 1, 0.36, 1] as const;

// Abanico: giro y desplazamiento de cada copia al salir del sobrecito.
const ABANICO = [
  { rot: -7, y: 6 },
  { rot: 2.5, y: -4 },
  { rot: 8, y: 8 },
];

export function PhotoPocket({
  photos,
  color,
  authorName,
}: {
  photos: PocketPhoto[];
  /** color del sobre de la carta: el sobrecito es de la misma familia */
  color: string;
  authorName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);

  // Escape cierra: primero la foto ampliada, luego el sobrecito.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (zoom !== null) setZoom(null);
      else {
        playSobrecito();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, zoom]);

  if (photos.length === 0) return null;

  const flapColor = shade(color, -14);

  function abrir() {
    playSobrecito();
    setOpen(true);
  }

  function cerrar() {
    playSobrecito();
    setZoom(null);
    setOpen(false);
  }

  return (
    <>
      {/* Sobrecito cerrado: vive en el flujo, bajo el escenario, al lado del
          audio y del vídeo. Mismo material que el sobre grande, a escala. */}
      <motion.button
        type="button"
        onClick={abrir}
        // Respira despacio: sin esto nadie adivina que el sobrecito se abre.
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        whileHover={{ scale: 1.04, rotate: -1 }}
        whileTap={{ scale: 0.97 }}
        className="relative block h-[74px] w-[118px] shrink-0 rounded-md"
        style={{
          background: `linear-gradient(180deg, ${color}, ${shade(color, -8)})`,
          boxShadow: "0 12px 24px -14px rgba(16,27,54,0.7)",
          border: "1px solid rgba(0,0,0,0.12)",
        }}
        aria-label={`Abrir el sobre con ${photos.length} foto${photos.length === 1 ? "" : "s"}`}
      >
        {/* solapa cerrada */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 block h-[58%]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: `linear-gradient(180deg, ${flapColor}, ${shade(flapColor, -7)})`,
          }}
        />
        {/* estrellita de lacre, como en el sobre grande */}
        <span
          className="pointer-events-none absolute left-1/2 top-[58%] block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #e8c069, #d9a83f 60%, #b98a2c)",
          }}
        />
        {/* asoman los cantos de las copias por la boca del sobrecito */}
        <span className="pointer-events-none absolute inset-x-7 bottom-[5px] block h-[4px] rounded-sm bg-[#fffdf8]/55" />
        <span className="pointer-events-none absolute inset-x-9 bottom-[10px] block h-[3px] rounded-sm bg-[#fffdf8]/35" />
        {/* El rótulo va en pastilla, como el título del presentador: detrás no
            está el fondo del sitio, sino el del TEMA de la carta, que puede ser
            oscuro o claro; sin pastilla, la tinta desaparece en la mitad de los
            temas. */}
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--surface)]/85 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/85 shadow-sm backdrop-blur">
          {photos.length} foto{photos.length === 1 ? "" : "s"}
        </span>
      </motion.button>

      {/* Abierto: las copias salen en abanico sobre un velo oscuro */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="velo fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-5 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={cerrar}
          >
            <p className="text-center text-sm uppercase tracking-[0.24em] text-[var(--gold)]">
              {authorName ? `Fotos de ${authorName}` : "Las fotos"}
            </p>

            <div
              className="flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((p, i) => {
                const fan = ABANICO[i % ABANICO.length];
                const ampliada = zoom === i;
                return (
                  <motion.button
                    type="button"
                    key={p.url}
                    onClick={() => setZoom(ampliada ? null : i)}
                    className="relative block"
                    style={{ zIndex: ampliada ? 2 : 1 }}
                    initial={{ opacity: 0, y: 90, rotate: 0, scale: 0.55 }}
                    animate={{
                      opacity: 1,
                      y: ampliada ? 0 : fan.y,
                      rotate: ampliada ? 0 : fan.rot,
                      scale: ampliada ? 1.12 : 1,
                    }}
                    exit={{ opacity: 0, y: 70, scale: 0.6 }}
                    transition={{
                      duration: 0.7,
                      delay: open ? i * 0.09 : 0,
                      ease: PAPER_EASE,
                    }}
                  >
                    {/* copia revelada: marco de papel, como una polaroid */}
                    <span className="block bg-[#fffdf8] p-2 pb-6 shadow-[0_22px_45px_-20px_rgba(0,0,0,0.8)]">
                      <img
                        src={p.url}
                        alt={`Foto ${i + 1}`}
                        className="block object-cover"
                        style={{
                          width: `min(${photos.length > 2 ? "27vw" : "40vw"}, 230px)`,
                          aspectRatio: `${1 / Math.min(Math.max(p.ratio, 0.4), 2.2)}`,
                        }}
                      />
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={cerrar}
              className="rounded-full border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] px-5 py-2 text-xs text-[var(--ink)] backdrop-blur transition-colors hover:border-[var(--borde-vivo)]"
            >
              Guardarlas de nuevo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
