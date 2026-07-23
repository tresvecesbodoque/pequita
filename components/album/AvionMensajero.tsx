"use client";

import { useEffect, useState } from "react";

// La avioneta que cruza el cielo del álbum, ahora tirando de un papelito con la
// cuenta regresiva al cumpleaños. El conteo (días + horas) basta: es un detalle,
// no el reloj principal (ese vive en el bloque grande de Countdown).

function faltan(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), fin: ms === 0 };
}

export function AvionMensajero({ isoDate }: { isoDate: string | null }) {
  const target = isoDate ? new Date(isoDate).getTime() : null;
  const [t, setT] = useState<ReturnType<typeof faltan> | null>(null);

  useEffect(() => {
    if (target === null) return;
    setT(faltan(target));
    const id = setInterval(() => setT(faltan(target)), 30000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="avion-vuelo" aria-hidden>
      {t && (
        <span className="avion-papel">
          {t.fin ? "¡hoy! 🎉" : `faltan ${t.dias}d ${t.horas}h`}
        </span>
      )}
      <svg className="avion-svg" viewBox="0 0 120 40" fill="none">
        <path d="M18 24 h56 c8 0 12 -4 12 -8 h-48" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 16 l-8 -10 h10 l12 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 24 l-6 8 h9 l8 -8" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M92 20 q10 2 22 0" stroke="var(--night-ink)" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="1 6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
