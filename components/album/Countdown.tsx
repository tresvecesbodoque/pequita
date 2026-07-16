"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Cuenta regresiva del día D: los sobres duermen hasta la fecha. Al llegar a
// cero, recarga para que el servidor muestre el álbum despierto.

function faltan(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    min: Math.floor((s % 3600) / 60),
    seg: s % 60,
    fin: ms === 0,
  };
}

export function Countdown({ isoDate }: { isoDate: string }) {
  const target = new Date(isoDate).getTime();
  // null hasta montar: evita el desajuste de hidratación (hora servidor≠cliente).
  const [t, setT] = useState<ReturnType<typeof faltan> | null>(null);

  useEffect(() => {
    setT(faltan(target));
    const id = setInterval(() => {
      const next = faltan(target);
      setT(next);
      if (next.fin) {
        clearInterval(id);
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!t) {
    return (
      <div className="relative z-10 mx-auto mt-4 h-[168px] max-w-md" aria-hidden />
    );
  }

  const bloques: [number, string][] = [
    [t.dias, "días"],
    [t.horas, "horas"],
    [t.min, "min"],
    [t.seg, "seg"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto mt-4 max-w-md"
    >
      <p className="text-sm text-[var(--night-ink)]/80">
        El cielo despertará en…
      </p>
      <div className="mt-4 flex justify-center gap-3">
        {bloques.map(([n, etiqueta]) => (
          <div
            key={etiqueta}
            className="flex min-w-[64px] flex-col items-center rounded-xl border-2 border-[var(--gold)]/40 bg-white/5 px-3 py-2 backdrop-blur"
          >
            <span
              className="text-3xl text-[var(--gold)]"
              style={{ fontFamily: "var(--font-sketch)" }}
            >
              {String(n).padStart(2, "0")}
            </span>
            <span className="text-[0.65rem] uppercase tracking-widest text-[var(--night-ink)]/60">
              {etiqueta}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-[var(--night-ink)]/55">
        Las cartas duermen hasta entonces. Vuelve el día de tu cumpleaños. 💛
      </p>
    </motion.div>
  );
}
