"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Cuenta regresiva de la PORTADA (enlace de la familia). Antes del día muestra
// el conteo; al llegar a cero, el saludo de cumpleaños. A diferencia de la del
// álbum, aquí NO recargamos la página (no hay estado de servidor que voltear).

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

export function HomeCountdown({ isoDate, nick }: { isoDate: string; nick: string }) {
  const target = new Date(isoDate).getTime();
  // null hasta montar: evita el desajuste de hidratación (hora servidor≠cliente).
  const [t, setT] = useState<ReturnType<typeof faltan> | null>(null);

  useEffect(() => {
    setT(faltan(target));
    const id = setInterval(() => {
      const next = faltan(target);
      setT(next);
      if (next.fin) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Reserva de alto para no provocar salto de layout durante la hidratación.
  if (!t) return <div className="mx-auto mt-8 h-[120px] max-w-md" aria-hidden />;

  if (t.fin) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-8 text-4xl text-[var(--accent)] sm:text-5xl"
        style={{ fontFamily: "var(--font-sketch)" }}
      >
        ¡Feliz Cumpleaños {nick}! 🎉
      </motion.p>
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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-8 max-w-md"
    >
      <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">
        el cumpleaños de {nick} llega en
      </p>
      <div className="mt-4 flex justify-center gap-2.5 sm:gap-3">
        {bloques.map(([n, etiqueta]) => (
          <div
            key={etiqueta}
            className="flex min-w-[60px] flex-col items-center rounded-xl border-2 border-[var(--foreground)]/60 bg-[var(--surface)] px-3 py-2 shadow-[3px_4px_0_rgba(124,27,34,0.2)]"
          >
            <span
              className="text-3xl text-[var(--accent)]"
              style={{ fontFamily: "var(--font-sketch)" }}
            >
              {String(n).padStart(2, "0")}
            </span>
            <span className="text-[0.62rem] uppercase tracking-widest text-[var(--muted)]">
              {etiqueta}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
