"use client";

/* eslint-disable jsx-a11y/media-has-caption */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// "La película": reproduce los vídeo-saludos de la familia uno tras otro, como
// un único gran vídeo. No re-codifica nada (sería pesado/caro); es un reproductor
// que encadena los clips guardados en R2. Al terminar uno, salta al siguiente.

export type Clip = { slug: string; autor: string; videoUrl: string };

export function MontajePlayer({ clips }: { clips: Clip[] }) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Al cambiar de clip (ya iniciada la película), reproducir automáticamente.
  useEffect(() => {
    if (started && !finished) videoRef.current?.play().catch(() => {});
  }, [current, started, finished]);

  if (clips.length === 0) {
    return (
      <p className="mx-auto max-w-md text-center text-[var(--night-ink)]/70">
        Aún no hay vídeos en la película. Cuando la familia grabe sus saludos,
        aparecerán aquí. 🎬
      </p>
    );
  }

  function next() {
    if (current + 1 < clips.length) setCurrent((c) => c + 1);
    else setFinished(true);
  }

  function reiniciar() {
    setCurrent(0);
    setFinished(false);
    setStarted(true);
  }

  const clip = clips[current];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        {!started ? (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#141d33] to-[#0a0f1e] text-[var(--gold)]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--gold)] text-3xl">
              ▶
            </span>
            <span className="text-lg" style={{ fontFamily: "var(--font-sketch)" }}>
              Reproducir la película
            </span>
            <span className="text-xs text-white/60">{clips.length} saludos de tu familia</span>
          </button>
        ) : finished ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#141d33] to-[#0a0f1e] text-center">
            <p className="text-4xl text-[var(--gold)]" style={{ fontFamily: "var(--font-sketch)" }}>
              Fin 💛
            </p>
            <p className="max-w-xs text-sm text-white/70">
              Toda tu familia, en una sola película. Feliz cumpleaños.
            </p>
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-full border-2 border-[var(--gold)] px-5 py-2 text-sm text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              ↺ Verla de nuevo
            </button>
          </div>
        ) : (
          <>
            <video
              key={clip.slug}
              ref={videoRef}
              src={clip.videoUrl}
              autoPlay
              playsInline
              controls
              onEnded={next}
              className="aspect-video w-full bg-black"
            />
            {/* Nombre del autor del clip actual */}
            <motion.div
              key={`label-${clip.slug}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute bottom-14 left-4 rounded-full bg-black/55 px-3 py-1 text-sm text-white backdrop-blur"
            >
              {clip.autor}
            </motion.div>
          </>
        )}
      </div>

      {/* Barra de progreso: en qué saludo vamos */}
      {started && !finished && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-sm text-[var(--night-ink)]/70 hover:text-[var(--gold)] disabled:opacity-30"
          >
            ‹ anterior
          </button>
          <div className="flex items-center gap-1.5">
            {clips.map((c, i) => (
              <span
                key={c.slug}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-5 bg-[var(--gold)]" : "w-1.5 bg-[var(--night-ink)]/30"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="text-sm text-[var(--night-ink)]/70 hover:text-[var(--gold)]"
          >
            siguiente ›
          </button>
        </div>
      )}
      {started && !finished && (
        <p className="mt-2 text-center text-xs text-[var(--night-ink)]/55">
          Saludo {current + 1} de {clips.length} — se encadenan solos
        </p>
      )}
    </div>
  );
}
