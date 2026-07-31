"use client";

import { useEffect } from "react";

/**
 * La revelación (ver DESIGN.md). El día del cumpleaños el mundo pasa de la
 * noche al papel: basta con poner la clase `dia` en <html> y todos los tokens
 * de tokens.css viran a la vez, sin que ningún componente se entere.
 *
 * Va en el cliente y no en el render del servidor a propósito: el layout se
 * cachea, y una clase decidida en build se quedaría clavada en "noche" el día D.
 * Aquí se decide con el reloj de quien mira, igual que en el contador.
 */
export function ModoDia({ isoDate }: { isoDate: string | null }) {
  useEffect(() => {
    if (!isoDate) return;
    const objetivo = new Date(isoDate).getTime();
    if (Number.isNaN(objetivo)) return;

    const raiz = document.documentElement;
    const revisar = () => {
      if (Date.now() >= objetivo) {
        raiz.classList.add("dia");
        return true;
      }
      return false;
    };

    if (revisar()) return;
    // Todavía es de noche: se espera al minuto exacto para que, si alguien está
    // mirando cuando llegue la hora, el mundo cambie delante de sus ojos.
    const id = window.setInterval(() => {
      if (revisar()) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isoDate]);

  return null;
}
